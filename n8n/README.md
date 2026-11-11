# Catálogo Lococo → Projaska (n8n + Scrapling)

Toma **todos** los productos de la lista pública de Importadora Lococo y los mantiene en Projaska, emparejando siempre por **modelo**:

| Qué | Cuándo se actualiza |
|---|---|
| Precio (costo USD sin IVA) | Siempre. Si cambia más de `MAX_CHANGE_PCT`, queda para revisar a mano |
| Stock (`inmediato` / `deposito_2` / `tercer_deposito`) | Siempre |
| Activo | Se desactiva si Lococo lo saca de la lista; se reactiva si vuelve |
| Nombre, marca, categoría, ficha técnica, foto | Al crear, y después solo si están vacíos (`OVERWRITE_CONTENT=true` para pisarlos siempre) |
| Productos nuevos de Lococo | Se crean solos (`PUBLISH_NEW` decide si salen publicados u ocultos) |

Ya no usa IA: el modelo alcanza para emparejar.

## Flujo

1. **Scrapear Lococo**: carga los ~930 productos (modelo, nombre, precio, stock, marca, foto).
2. **Mis productos**: trae tu catálogo (`GET /api/price-sync/products`).
3. **Planificar**: modelo exacto (ignora guiones/espacios) → si no, "un modelo contiene al otro" con un solo candidato → si no, producto nuevo. Lo tuyo que no está en Lococo → desactivar.
4. **Partir en tandas**: fichas de a `DETAILS_CHUNK` (40). La tanda 1 además lleva lo que no necesita ficha (precio/stock de los ya completos, desactivar).
5. **Loop por tanda** (*Recorrer tandas*), y en cada vuelta:
   - **Fichas Lococo**: abre las 40 fichas (categoría + características + foto grande).
   - **Armar operaciones**: calcula qué cambia en esos productos.
   - **Enviar a mi tienda**: los guarda en la BD **en el momento** (`POST /api/price-sync/upsert`, de a `BATCH_SIZE`). Con `DRY_RUN=true` no envía.
   - **Registrar tanda**: anota resultado y errores de esa tanda.
   Si el scraper se cae en una tanda, esas fichas quedan para la próxima corrida y el loop sigue.
6. **Resumen**: totales de todas las tandas: creados / actualizados / desactivados, errores, revisar a mano, duplicados.
7. **Avisar por Telegram**: te manda el reporte (creados, actualizados, qué no se pudo cargar y por qué). Necesita `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` en el `.env`.

## Productos sin código en Lococo

Unos 120 productos de Lococo no traen código. El scraper:
- Busca el modelo dentro del nombre (ej. `CÁMARA WI-FI EZVIZ EB5 · CS-EB5-R100-2F8WFL` → `CS-EB5-R100-2F8WFL`).
- Si no hay (racks, cables, sirenas genéricas), arma una clave estable `LOC-XXXXXXXX` a partir del nombre. Si Lococo le cambia el nombre, se crea uno nuevo y el viejo se desactiva.

## Puesta en marcha

1. Pasale `PROMPT-CLAUDE-CODE-projaska.md` a Claude Code en el repo de Projaska, desplegá y migrá.
2. Copiá `.env.example` a `.env` y completá `MY_API_KEY`.
3. `docker compose up -d --build --force-recreate`
4. En n8n: desactivá/borrá el workflow viejo e importá `workflow-catalogo.json`.
5. Carga inicial: `DETAILS_MAX_PER_RUN=1000`, `DRY_RUN=true` → Execute → revisá **Armar operaciones**.
6. `DRY_RUN=false` → recreá contenedores → Execute → revisá **Resumen**.
7. Volvé a `DETAILS_MAX_PER_RUN=300` y activá el workflow (cada 6 h).

Después de cambiar el `.env`: `docker compose up -d --force-recreate n8n scraper`.

Ver el avance de las fichas en vivo:
```
docker compose logs -f scraper
```

Probar el scraper solo:
```
docker compose exec n8n wget -qO- --post-data='' http://scraper:8000/competitor | head -c 600
```
