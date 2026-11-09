# Precios vs competencia: n8n + Scrapling + Ollama

## Fuente configurada: Importadora Lococo

Con `COMPETITOR_SOURCE=lococo`, el scraper:
- Abre `importadoralococo.com/lista-de-precios`, que es pública y no necesita login.
- Hace clic en "Mostrar más productos" hasta cargar los ~930 productos.
- Lee código de modelo, nombre, precio en U$S, stock y la cotización del dólar que publica la lista.

La lista se arma con JavaScript dentro de un shadow DOM, así que este modo siempre usa navegador (StealthyFetcher). Por eso el `shm_size: 1gb` en el compose.

Projaska guarda el **costo en USD** (`TARGET_CURRENCY=USD`), así que el precio de Lococo pasa tal cual, con 2 decimales. El precio de venta en pesos lo calcula la tienda.
Si algún día la base guarda pesos: `TARGET_CURRENCY=ARS` y el cálculo pasa a ser `U$S × dólar × (1 + IVA) × (1 + margen)`.

## Qué hace (cada 6 horas o a mano)

1. **Scrapling** baja nombre y precio de los productos de la competencia.
2. Trae **tus productos** desde tu API.
3. Por cada producto tuyo, preselecciona los 8 nombres más parecidos de la competencia.
4. **Ollama** decide cuál es exactamente el mismo producto. Solo elige; el precio sale siempre del scraping, así el modelo no puede inventarlo.
5. Calcula `precio competencia × (1 + PRICE_MARGIN_PCT/100)` y lo redondea.
6. Si `DRY_RUN=false`, hace PATCH del precio en tu sitio.

## Levantarlo en la Casidy

```bash
cp .env.example .env              # completá tus datos
docker compose up -d --build
# IA: por defecto Groq (gratis, en la nube). Poné LLM_API_KEY en el .env.
# Si preferís Ollama local: docker compose --profile ollama up -d && docker compose exec ollama ollama pull qwen2.5:7b
```

1. Abrí http://localhost:5678 y creá tu usuario.
2. Andá a **Workflows → Import from file** y elegí `workflow-precios.json`.
3. Ejecutalo con el trigger **Manual** y revisá la salida de **Calcular precios**.

## Configuración (todo en `.env`)

| Variable | Para qué |
|---|---|
| `PRICE_MARGIN_PCT` | Tu margen: `40` = costo + 40% (proveedor), `-5` = 5% más barato (competencia) |
| `ADD_IVA_PCT` | IVA a sumar (Lococo publica sin IVA) |
| `USD_RATE` | Dólar fijo; vacío = el que publica Lococo |
| `PRICE_ROUND_TO` | Redondeo: `100` → $19.000 |
| `MAX_CHANGE_PCT` | Si el cambio es mayor, queda como `review` y no se toca |
| `MIN_CONFIDENCE` | Confianza mínima de Ollama para aceptar la coincidencia |
| `DRY_RUN` | `true` = solo calcula. Ponelo en `false` cuando confíes en los resultados |
| `COMPETITOR_*` | URLs y selectores CSS de la competencia |
| `OLLAMA_MODEL` | Modelo a usar |

Después de cambiar el `.env`, corré `docker compose up -d` para que los contenedores lo tomen.

### Cómo sacar los selectores
En la página de la competencia: clic derecho sobre un producto → **Inspeccionar**.
- `COMPETITOR_ITEM_SEL`: la clase del contenedor de cada producto (ej. `.product-card`).
- `COMPETITOR_NAME_SEL` y `COMPETITOR_PRICE_SEL`: las clases del nombre y del precio, dentro de ese contenedor.

Para probar el scraper solo: `docker compose exec n8n wget -qO- --post-data='' http://scraper:8000/competitor`

Si la página carga los productos con JavaScript o tiene Cloudflare, poné `COMPETITOR_STEALTH=true`.

## Lo que tiene que exponer tu sitio

```
GET  MY_PRODUCTS_URL → [{ "id": 1, "sku": null, "model": "DH-HAC-B1A21P", "name": "...", "description": "...", "price": 19500 }]
POST MY_UPDATE_URL   body: { "match": { "id": 1 } | { "model": "..." } | { "sku": "..." },
                             "set": { "price": 47900, "sku": "...", "description": "..." },
                             "source": "n8n-lococo" }
Header: Authorization: Bearer MY_API_KEY
```

## Modos

1. **Carga inicial (`SYNC_MODE=model`):** empareja tu modelo con el código de Lococo (exacto, por prefijo o con Ollama si hay dudas) y te carga SKU, precio y descripción.
El nodo **Resumen** al final lista cuántos productos se actualizaron bien y los avisos: 404 (no encontrado) y 409 (modelo duplicado o SKU en uso). Esos avisos no cortan el flujo.

2. **Mantenimiento (`SYNC_MODE=sku`):** cuando tus SKU ya son los de Lococo, empareja por SKU. Todo es coincidencia exacta y Ollama casi no se usa.

## Estados en "Calcular cambios"

- `update`: se actualiza (si `DRY_RUN=false`). En `set` ves qué campos cambian.
- `review`: el precio cambia más que `MAX_CHANGE_PCT`; revisalo a mano.
- `skip`: no hubo coincidencia, la confianza fue baja o no hay cambios.
