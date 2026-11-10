"""Microservicio de scraping de la competencia (Scrapling + FastAPI).

Toda la configuración sale del .env:
  COMPETITOR_URLS        URLs separadas por coma (una por página del listado)
  COMPETITOR_ITEM_SEL    selector CSS de cada tarjeta de producto
  COMPETITOR_NAME_SEL    selector CSS del nombre, relativo a la tarjeta
  COMPETITOR_PRICE_SEL   selector CSS del precio, relativo a la tarjeta
  COMPETITOR_LINK_SEL    (opcional) selector del <a> del producto
  COMPETITOR_STEALTH     true = navegador (StealthyFetcher), false = HTTP (Fetcher)
"""
import hashlib
import logging
import os
import re
import time
from urllib.parse import urljoin

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from scrapling.fetchers import Fetcher, StealthyFetcher

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
log = logging.getLogger("scraper")

app = FastAPI(title="scraper-competencia")


def env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


def parse_price(raw: str | None) -> float | None:
    """Convierte '$ 12.345,67', 'ARS 12345', '12,345.67' en float."""
    if not raw:
        return None
    s = re.sub(r"[^\d.,]", "", raw)
    if not s:
        return None
    if "," in s and "." in s:
        # El separador que aparece último es el decimal
        if s.rfind(",") > s.rfind("."):
            s = s.replace(".", "").replace(",", ".")   # 12.345,67
        else:
            s = s.replace(",", "")                       # 12,345.67
    elif "," in s:
        # 12,50 -> decimal | 12,345 -> miles
        s = s.replace(",", ".") if len(s.split(",")[-1]) <= 2 else s.replace(",", "")
    elif "." in s:
        # 12.345 -> miles (formato AR) | 12.5 -> decimal
        if len(s.split(".")[-1]) == 3:
            s = s.replace(".", "")
    try:
        return float(s)
    except ValueError:
        return None


def text_of(el, selector: str) -> str | None:
    found = el.css(selector)
    if not found:
        return None
    return found[0].get_all_text(separator=" ", strip=True) or None


def fetch(url: str, stealth: bool):
    if stealth:
        return StealthyFetcher.fetch(url, headless=True, network_idle=True)
    return Fetcher.get(url)


@app.get("/health")
def health():
    return {"ok": True}


# ---------- Importadora Lococo (lista pública, renderizada en shadow DOM) ----------
LOCOCO_EXTRACT_JS = """() => {
  const r = document.getElementById('rd')?.shadowRoot;
  if (!r) return [];
  const txt = el => (el?.textContent || '').replace(/\\s+/g, ' ').trim();
  return [...r.querySelectorAll('article.card')].map(c => {
    const leaves = [...c.querySelectorAll('*')].filter(e => e.children.length === 0);
    const priceEl = leaves.find(e => /(U\\$S|US\\$|\\$)\\s?\\d/.test(e.textContent));
    const badge = c.querySelector('.badge');
    const img = c.querySelector('.ph img.ok');
    return { code: txt(c.querySelector('.code')), name: txt(c.querySelector('.nm')),
             price_raw: txt(priceEl), stock: txt(badge),
             stock_level: badge ? ([...badge.classList].find(k => k !== 'badge') || null) : null,
             pack: txt(c.querySelector('.bul')) || null,
             image_url: img ? img.src : null };
  });
}"""

LOCOCO_RATE_JS = """() => {
  const t = document.getElementById('rd')?.shadowRoot?.querySelector('.foot-note')?.textContent || '';
  const m = t.match(/D[oó]lar[^$]*\\$\\s?([\\d.,]+)/i);
  return m ? m[1] : null;
}"""

# Abre la ficha de un código usando el buscador de la lista y devuelve categoría, specs y foto grande
LOCOCO_DETAIL_JS = """async (target) => {
  const r = document.getElementById('rd')?.shadowRoot; if (!r) return { code: target, error: 'sin shadowRoot' };
  const txt = el => (el?.textContent || '').replace(/\\s+/g, ' ').trim();
  const norm = s => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const sleep = ms => new Promise(s => setTimeout(s, ms));
  const inp = r.querySelector('header input[type=search], header input');
  if (!inp) return { code: target, error: 'sin buscador' };
  const T = norm(target);
  // Búsquedas a probar: el texto completo, el segmento que parece modelo y las primeras palabras
  const segs = target.split('·').map(s => s.trim()).filter(Boolean);
  const queries = [...new Set([
    ...(segs.length > 1 ? [] : [target]),
    ...segs.filter(s => /\\d/.test(s) && /-/.test(s) && !/\\s/.test(s)),
    segs[0], segs[0].split(' ').slice(0, 3).join(' '), target,
  ])].filter(Boolean);
  let card = null;
  for (const q of queries) {
    if (r.querySelector('.view.on .crumb')) { r.querySelector('.view.on .crumb a')?.click(); await sleep(300); }
    if (location.hash.startsWith('#ficha')) { location.hash = '#info'; await sleep(200); }
    inp.focus(); inp.value = q; inp.dispatchEvent(new Event('input', { bubbles: true }));
    for (let k = 0; k < 15 && !card; k++) {
      await sleep(120);
      card = [...r.querySelectorAll('article.card')].find(c => norm(txt(c.querySelector('.code'))) === T);
    }
    if (card) break;
  }
  if (!card) return { code: target, error: 'no aparece en el buscador' };
  card.querySelector('.code').click();
  let v = null;
  for (let k = 0; k < 40; k++) {
    await sleep(120); v = r.querySelector('.view.on');
    const h = norm(txt(v?.querySelector('h1')));
    if (h && (h === T || h.startsWith(T) || T.startsWith(h))) break;
    v = null;
  }
  if (!v) return { code: target, error: 'no abrió la ficha' };
  const crumbs = [...v.querySelectorAll('.crumb a')].map(txt);
  const img = v.querySelector('.fi .panel.big img.ok');
  return { code: target, category: crumbs[1] || null, specs: [...v.querySelectorAll('.panel.desc li')].map(txt).filter(Boolean),
           image_url: img ? img.src : null };
}"""

# Marcas que se buscan dentro del nombre. Se puede pisar con BRANDS=... en el .env (separadas por coma)
DEFAULT_BRANDS = ("HIKVISION,DAHUA,EZVIZ,TIANDY,IMOU,CYGNUS,INTELBRAS,PICOO,SUDVISION,MARSHALL,NETIS,RANGER,"
                  "TP-LINK,MERCUSYS,UBIQUITI,TENDA,RUIJIE,REYEE,HILOOK,HIKSEMI,ZKTECO,AJAX,PARADOX,DSC,GARNET,"
                  "X-28,ALONSO,PPA,SEAGATE,WESTERN,TOSHIBA,KINGSTON,SANDISK,PHILCO")
BRAND_PREFIX = {"DS-": "HIKVISION", "IDS-": "HIKVISION", "DH-": "DAHUA", "IPC-": "DAHUA", "CY-": "CYGNUS", "CS-": "EZVIZ"}
STOCK_SLUG = {"ok": "inmediato", "warn": "deposito_2", "off": "tercer_deposito"}
MODEL_SEG = re.compile(r"^[A-Z0-9][A-Z0-9\-/.]{4,}$")


def detect_brand(name: str, code: str | None) -> str | None:
    brands = [b.strip().upper() for b in (env("BRANDS") or DEFAULT_BRANDS).split(",") if b.strip()]
    words = set(re.findall(r"[A-Z0-9ÁÉÍÓÚÑ\-]{2,}", f"{name} {code or ''}".upper()))
    b = next((k for k in brands if k in words), None)
    if not b and code:
        b = next((v for p, v in BRAND_PREFIX.items() if code.upper().startswith(p)), None)
    return b.title() if b else None


def resolve_model(code_txt: str, name_txt: str) -> tuple[str, str, str]:
    """Devuelve (modelo, nombre, origen). Unas 120 tarjetas de Lococo no traen código: el nombre
    viene en .code. Ahí se busca el modelo dentro del nombre (ej. 'CS-EB5-R100-2F8WFL') y, si no hay,
    se arma una clave estable 'LOC-xxxxxxxx' a partir del nombre."""
    if name_txt:
        return code_txt, name_txt, "codigo"
    name = code_txt
    segs = [s.strip() for s in name.split("·")]
    for s in segs:
        if MODEL_SEG.match(s) and re.search(r"\d", s) and "-" in s:
            return s, " · ".join(x for x in segs if x != s), "nombre"
    h = hashlib.sha1(re.sub(r"[^A-Z0-9]", "", name.upper()).encode()).hexdigest()[:8].upper()
    return f"LOC-{h}", name, "generado"


def scrape_lococo(url: str) -> dict:
    data: dict = {"cards": [], "rate": None}

    def action(page):
        page.wait_for_selector("#rd article.card", timeout=30000)
        for _ in range(60):  # "Mostrar más productos" carga de a 60
            btn = page.locator("#rd .more button")  # los locators de Playwright atraviesan el shadow DOM
            if btn.count() == 0 or not btn.first.is_visible():
                break
            btn.first.click()
            page.wait_for_timeout(1200)
        data["cards"] = page.evaluate(LOCOCO_EXTRACT_JS)
        data["rate"] = page.evaluate(LOCOCO_RATE_JS)
        return page

    StealthyFetcher.fetch(url, headless=True, network_idle=True, page_action=action)

    items = []
    for c in data["cards"]:
        price = parse_price(c.get("price_raw"))
        if not c.get("code") or price is None:
            continue
        model, raw_name, model_src = resolve_model(c["code"], c.get("name") or "")
        raw = c.get("price_raw") or ""
        currency = "USD" if re.search(r"U\$S|US\$|USD", raw) else "ARS"
        items.append({
            "name": f"{model} — {raw_name}",
            "raw_name": raw_name,
            "code": model,
            "model_source": model_src,
            "brand": detect_brand(raw_name, model if model_src != "generado" else None),
            "price": price,
            "currency": currency,
            "price_raw": raw,
            "stock": c.get("stock"),
            "stock_status": STOCK_SLUG.get(c.get("stock_level") or "", "desconocido"),
            "pack": c.get("pack"),
            "image_url": c.get("image_url"),
            "search": c["code"],
            "url": url,
        })
    return {"count": len(items), "items": items, "usd_rate": parse_price(data["rate"]), "errors": []}


def scrape_lococo_details(url: str, codes: list[str]) -> dict:
    out: dict = {"items": [], "errors": []}
    budget = float(env("DETAILS_TIME_BUDGET_S", "600"))  # tope por request; lo que no entra vuelve como error

    def action(page):
        page.wait_for_selector("#rd article.card", timeout=30000)
        t0 = time.monotonic()
        for i, code in enumerate(codes, 1):
            if time.monotonic() - t0 > budget:
                out["errors"] += [{"code": c, "error": "sin tiempo (queda para la próxima corrida)"} for c in codes[i - 1:]]
                log.warning("fichas: tope de %ss alcanzado en %d/%d", budget, i - 1, len(codes))
                break
            t1 = time.monotonic()
            d = {"code": code, "error": "sin intentar"}
            for _ in range(2):  # reintenta solo si encontró el producto pero la ficha no abrió
                try:
                    d = page.evaluate(LOCOCO_DETAIL_JS, code)
                except Exception as e:  # noqa: BLE001
                    d = {"code": code, "error": str(e)[:200]}
                if d.get("error") != "no abrió la ficha":
                    break
            (out["errors"] if d.get("error") else out["items"]).append(d)
            log.info("ficha %d/%d %.1fs %s %s", i, len(codes), time.monotonic() - t1,
                     "ERROR " + d["error"] if d.get("error") else "ok", code[:60])
        return page

    log.info("fichas: arrancando %d códigos", len(codes))
    StealthyFetcher.fetch(url, headless=True, network_idle=True, page_action=action)
    log.info("fichas: listo, %d ok, %d con error", len(out["items"]), len(out["errors"]))
    return {"count": len(out["items"]), **out}


class DetailsIn(BaseModel):
    codes: list[str] = []


@app.post("/details")
def details(body: DetailsIn):
    codes = [c for c in dict.fromkeys(body.codes) if c][: int(env("DETAILS_HARD_LIMIT", "1000"))]
    if not codes:
        return {"count": 0, "items": [], "errors": []}
    url = env("COMPETITOR_URLS", "https://importadoralococo.com/lista-de-precios").split(",")[0].strip()
    try:
        return scrape_lococo_details(url, codes)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(502, f"Fallo el scraping de fichas: {e}")


@app.post("/competitor")
def competitor():
    if env("COMPETITOR_SOURCE", "generic").lower() == "lococo":
        url = env("COMPETITOR_URLS", "https://importadoralococo.com/lista-de-precios").split(",")[0].strip()
        try:
            return scrape_lococo(url)
        except Exception as e:  # noqa: BLE001
            raise HTTPException(502, f"Fallo el scraping de Lococo: {e}")

    urls = [u.strip() for u in env("COMPETITOR_URLS").split(",") if u.strip()]
    item_sel = env("COMPETITOR_ITEM_SEL")
    name_sel = env("COMPETITOR_NAME_SEL")
    price_sel = env("COMPETITOR_PRICE_SEL")
    link_sel = env("COMPETITOR_LINK_SEL")
    stealth = env("COMPETITOR_STEALTH", "false").lower() == "true"

    if not (urls and item_sel and name_sel and price_sel):
        raise HTTPException(400, "Faltan COMPETITOR_URLS o selectores en el .env")

    items, errors = [], []
    for url in urls:
        try:
            page = fetch(url, stealth)
        except Exception as e:  # noqa: BLE001
            errors.append({"url": url, "error": str(e)})
            continue
        for card in page.css(item_sel):
            name = text_of(card, name_sel)
            price_raw = text_of(card, price_sel)
            price = parse_price(price_raw)
            if not name or price is None:
                continue
            link = None
            if link_sel:
                a = card.css(link_sel)
                if a and a[0].attrib.get("href"):
                    link = urljoin(url, a[0].attrib["href"])
            items.append({"name": name, "price": price, "price_raw": price_raw, "url": link or url})

    return {"count": len(items), "items": items, "errors": errors}
