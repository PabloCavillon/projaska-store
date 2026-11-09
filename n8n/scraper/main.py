"""Microservicio de scraping de la competencia (Scrapling + FastAPI).

Toda la configuración sale del .env:
  COMPETITOR_URLS        URLs separadas por coma (una por página del listado)
  COMPETITOR_ITEM_SEL    selector CSS de cada tarjeta de producto
  COMPETITOR_NAME_SEL    selector CSS del nombre, relativo a la tarjeta
  COMPETITOR_PRICE_SEL   selector CSS del precio, relativo a la tarjeta
  COMPETITOR_LINK_SEL    (opcional) selector del <a> del producto
  COMPETITOR_STEALTH     true = navegador (StealthyFetcher), false = HTTP (Fetcher)
"""
import os
import re
from urllib.parse import urljoin

from fastapi import FastAPI, HTTPException
from scrapling.fetchers import Fetcher, StealthyFetcher

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
    return { code: txt(c.querySelector('.code')), name: txt(c.querySelector('.nm')),
             price_raw: txt(priceEl), stock: txt(c.querySelector('.badge')) };
  });
}"""

LOCOCO_RATE_JS = """() => {
  const t = document.getElementById('rd')?.shadowRoot?.querySelector('.foot-note')?.textContent || '';
  const m = t.match(/D[oó]lar[^$]*\\$\\s?([\\d.,]+)/i);
  return m ? m[1] : null;
}"""


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
        if not c.get("name") or price is None:
            continue
        raw = c.get("price_raw") or ""
        currency = "USD" if re.search(r"U\$S|US\$|USD", raw) else "ARS"
        items.append({
            "name": f'{c.get("code", "")} — {c["name"]}'.strip(" —"),
            "code": c.get("code"),
            "price": price,
            "currency": currency,
            "price_raw": raw,
            "stock": c.get("stock"),
            "url": url,
        })
    return {"count": len(items), "items": items, "usd_rate": parse_price(data["rate"]), "errors": []}


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
