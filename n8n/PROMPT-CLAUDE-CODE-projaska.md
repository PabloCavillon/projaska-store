# Prompt para Claude Code (repo projaska-store)

Copiá todo lo que está debajo de la línea y pegalo en Claude Code, parado en el repo de Projaska.

---

Necesito extender la API de sincronización que ya existe (`src/app/api/price-sync/...`, auth Bearer con `PRICE_SYNC_API_KEY` en `src/lib/price-sync-auth.ts`, validaciones en `src/lib/validations/price-sync.ts`, log en `ProductSyncLog`). Ahora el proveedor (Importadora Lococo) es la fuente de TODO el catálogo: un flujo de n8n crea los productos nuevos, mantiene precio y stock, completa marca, categoría, ficha técnica y foto, y desactiva los que el proveedor dejó de listar. El emparejamiento es siempre por `model`.

Antes de escribir código, leé `prisma/schema.prisma` y el código actual de productos, categorías, marcas e imágenes, y adaptá lo que sigue a lo que ya existe (no dupliques modelos ni rompas la tienda). Si falta algún campo, agregalo con una migración.

## 1. Modelo de datos

Asegurate de que `Product` tenga (con estos nombres en la API, aunque en la base se llamen distinto):

- `model` (string, indexado; recomendado único entre productos activos)
- `brand` (si existe un modelo `Brand`, relación por nombre; si no, string)
- `category` (relación con `Category` por nombre; crear la categoría si no existe, con slug)
- `stockStatus` (string: `inmediato` | `deposito_2` | `tercer_deposito`)
- `inStock` (boolean)
- `active` (boolean; los inactivos no se muestran en la tienda pero no se borran)
- `specs` (string[] o Json; la ficha técnica en viñetas)
- `imageUrl` (URL pública de la foto principal en NUESTRO storage)
- `sourceImageUrl` (URL original del proveedor, para no volver a bajar la misma foto)
- `price` sigue siendo el COSTO en USD sin IVA (no cambia la lógica actual de precio de venta)

## 2. GET /api/price-sync/products (extender)

Devolver TODOS los productos (activos e inactivos) como array:

```json
[{ "id": "uuid", "sku": "...", "model": "...", "name": "...", "description": "...",
   "price": 17.4, "brand": "Hikvision", "category": "Cámaras", "stockStatus": "inmediato",
   "inStock": true, "active": true, "specs": ["IR 20 m"], "imageUrl": "https://..." }]
```

Sin paginar (son ~1000), con `select` para que sea liviano.

## 3. POST /api/price-sync/upsert (nuevo)

Misma auth. Body (validar con zod, máximo 100 items):

```json
{ "source": "n8n-lococo",
  "items": [
    { "op": "create", "match": null, "data": { "model": "...", "sku": "...", "name": "...", "description": "...",
      "brand": "Dahua", "category": "Cámaras", "price": 18, "stockStatus": "inmediato", "inStock": true,
      "active": true, "specs": ["..."], "imageUrl": "https://importadoralococo.com/..." } },
    { "op": "update", "match": { "id": "uuid" }, "data": { "price": 19.4, "stockStatus": "deposito_2" } },
    { "op": "deactivate", "match": { "id": "uuid" }, "data": { "active": false, "inStock": false } }
  ] }
```

Reglas:

- `data` es parcial: solo se tocan las claves que vienen.
- `create`: si ya existe un producto con ese `model` (comparando sin guiones, espacios ni mayúsculas), NO crear: tratarlo como `update` sobre ese producto. Si no hay `sku`, usar el `model`. Si el `sku` choca con otro producto, agregar sufijo `-2`, `-3`. Generar slug único desde nombre + modelo. Si falta categoría, usar "Sin categoría".
- `brand` y `category` llegan como nombre: buscar sin distinguir mayúsculas/acentos y crear si no existe.
- `imageUrl` llega con la URL del PROVEEDOR: si es distinta de `sourceImageUrl`, descargarla en el servidor (timeout 10 s, máximo 5 MB, solo `image/*`), subirla al storage que ya usa la tienda (si no hay ninguno, usar Vercel Blob con `@vercel/blob`), guardar la URL nuestra en `imageUrl` y la original en `sourceImageUrl`. Si la descarga falla, seguir sin foto y devolver `warning`.
- `price` > 0, `specs` array de strings (máximo 40, cada uno máximo 200 caracteres).
- Procesar item por item: un error en uno NO frena el lote.
- Registrar cada cambio en `ProductSyncLog` (op, campos cambiados, source).
- Revalidar las páginas/tags de catálogo afectadas (`revalidateTag`/`revalidatePath`) una vez por lote, no por producto.
- `export const maxDuration = 60` en la ruta.

Respuesta 200 (siempre que el body sea válido), `results` en el mismo orden que `items`:

```json
{ "results": [
  { "index": 0, "id": "uuid", "model": "...", "status": "created" },
  { "index": 1, "id": "uuid", "status": "updated", "changed": ["price", "stockStatus"] },
  { "index": 2, "id": "uuid", "status": "unchanged" },
  { "index": 3, "id": "uuid", "status": "deactivated" },
  { "index": 4, "status": "error", "error": "mensaje claro" },
  { "index": 5, "id": "uuid", "status": "created", "warning": "no se pudo bajar la foto" }
] }
```

Errores generales: 401 token inválido, 400 body inválido (con el detalle de zod).

## 4. Tienda

- Ocultar `active = false` en listados, búsqueda, sitemap y página de producto (404 o "no disponible").
- Mostrar el estado de stock: `inmediato` → "Entrega inmediata", `deposito_2` → "Entrega en 24/48 h", `tercer_deposito` → "Consultar disponibilidad". Dejá el texto en un solo lugar para poder cambiarlo.
- Mostrar `specs` como lista en la ficha del producto, y marca/categoría donde corresponda.
- Si `next.config` restringe dominios de imágenes, agregar el del storage.

## 5. Entrega

- Migración Prisma, `prisma generate`, tests de la validación zod y del upsert (crear, actualizar parcial, desactivar, modelo duplicado, foto que falla).
- No cambies `/api/price-sync/update` (queda por compatibilidad).
- Al final, decime: los comandos para migrar en Neon (`prisma migrate deploy`), las variables de entorno nuevas para Vercel (ej. `BLOB_READ_WRITE_TOKEN`) y la URL final del endpoint.
