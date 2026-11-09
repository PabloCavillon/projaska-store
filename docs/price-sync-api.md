# API de sincronización de precios

API interna para que un workflow de n8n mantenga los productos de Projaska al día con la lista de un proveedor (por ejemplo, Importadora Lococo): precio, SKU y descripción.

- **Base URL (producción):** `https://projaska.com`
- **Base URL (local):** `http://localhost:3000`
- **Formato:** JSON en el request y en la respuesta.

| Método | Ruta | Para qué |
|---|---|---|
| `GET` | `/api/price-sync/products` | Leer los productos a comparar |
| `POST` | `/api/price-sync/update` | Actualizar un producto |

---

## Autenticación

Los dos endpoints exigen este header:

```
Authorization: Bearer <PRICE_SYNC_API_KEY>
```

El token se compara con la variable de entorno `PRICE_SYNC_API_KEY` del servidor. Si falta el header, el token no coincide o la variable no está configurada, la respuesta es:

```http
401 Unauthorized
{ "error": "Unauthorized" }
```

Para generar un token:

```bash
openssl rand -hex 32
```

El mismo valor va en Vercel (`PRICE_SYNC_API_KEY`), en `.env.local` para desarrollo y en la credencial de n8n.

---

## GET /api/price-sync/products

Devuelve todos los productos **no borrados**, estén visibles en la tienda o no. Hay un ítem por producto, ordenados por SKU.

### Request

```bash
curl https://projaska.com/api/price-sync/products \
  -H "Authorization: Bearer $PRICE_SYNC_API_KEY"
```

### Respuesta 200

```json
[
  {
    "id": "3f2a9c1e-5b7d-4e0a-9c1f-2d8e6a4b7c90",
    "sku": "DH-HAC-B1A21P-U-0280B",
    "model": "HAC-B1A21P",
    "name": "Cámara bullet 2MP",
    "description": "Lente 2.8mm, IR 20m",
    "price": 18.5
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | UUID del producto. Es texto, no número. |
| `sku` | string | Siempre tiene valor y es único. |
| `model` | string \| null | Modelo del fabricante. Sirve para cruzar con el proveedor. |
| `name` | string | |
| `description` | string \| null | |
| `price` | number | **Costo en USD**, con hasta 2 decimales. El precio de venta en pesos lo calcula la tienda a partir de este valor. |

---

## POST /api/price-sync/update

Busca **un** producto y actualiza solo los campos que cambian. Cada campo que cambia se registra en el historial dentro de la misma transacción.

### Request

```bash
curl -X POST https://projaska.com/api/price-sync/update \
  -H "Authorization: Bearer $PRICE_SYNC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "match":  { "sku": "DH-HAC-B1A21P-U-0280B" },
    "set":    { "price": 19.9, "description": "Lente 2.8mm, IR 20m" },
    "source": "n8n-lococo"
  }'
```

### Body

| Campo | Tipo | Requerido | Reglas |
|---|---|---|---|
| `match` | object | sí | **Exactamente una** de estas claves: `id`, `sku` o `model` (string no vacío). |
| `set` | object | sí | Al menos uno de estos campos. Solo se tocan los que vienen. |
| `set.price` | number | no | Mayor que 0, en **USD**. Se redondea a 2 decimales. |
| `set.sku` | string | no | No vacío. No puede estar en uso por otro producto. |
| `set.description` | string | no | Puede ser `""`. |
| `source` | string | sí | Quién origina el cambio, por ejemplo `"n8n-lococo"`. Máximo 100 caracteres. |

Cómo se busca el producto según la clave de `match`:

- **`id`**: el UUID que devuelve el GET.
- **`sku` o `model`**: si hay 0 coincidencias devuelve 404; si hay más de 1, devuelve 409 sin actualizar nada.

Solo se buscan productos no borrados.

### Respuestas

**200: encontrado.** `changed` trae cada campo modificado como `[valor anterior, valor nuevo]`:

```json
{
  "id": "3f2a9c1e-5b7d-4e0a-9c1f-2d8e6a4b7c90",
  "changed": {
    "price": [18.5, 19.9],
    "sku": ["DH-OLD", "DH-HAC-B1A21P-U-0280B"]
  }
}
```

Si ningún valor cambió, `changed` es `{}` y no se escribe nada en la base ni en el historial. Un precio igual con otra cantidad de decimales (`19.9` contra `19.90`) no cuenta como cambio.

**400: body inválido.** Por ejemplo: JSON mal formado, dos claves en `match`, `price` menor o igual a 0, `set` vacío o claves desconocidas.

```json
{ "error": "Body inválido", "issues": [ { "path": ["set", "price"], "message": "..." } ] }
```

**401: token ausente o incorrecto.** Ver [Autenticación](#autenticación).

**404: ningún producto coincide.**

```json
{ "error": "No se encontró ningún producto", "match": { "model": "XYZ" } }
```

**409: conflicto.** No se actualiza nada.

```json
{ "error": "Hay más de un producto con ese criterio; no se actualizó nada", "match": { "model": "XYZ" } }
```
```json
{ "error": "El SKU \"DH-123\" ya lo usa otro producto (Cámara domo, id 9b1e…); no se actualizó nada" }
```

---

## POST /api/dollar-rate/refresh

Actualiza la cotización del dólar oficial (promedio compra/venta de dolarapi.com) en Configuración. Está pensado para un flujo de n8n con un **Schedule Trigger cada 1 hora**. Usa la misma API key que el resto.

### Request

```http
POST /api/dollar-rate/refresh
Authorization: Bearer <PRICE_SYNC_API_KEY>
```

No lleva body.

### Respuestas

| Status | Body | Cuándo |
|---|---|---|
| 200 | `{ "status": "updated" \| "unchanged", "previous": 1000, "dollarRate": 1065, "checkedAt": "..." }` | Se guardó la cotización. `unchanged` si era la misma; igual se registra la hora. |
| 401 | `{ "error": "Unauthorized" }` | Falta la API key o es incorrecta. |
| 409 | `{ "status": "rejected", "previous": 1000, "fetched": 1500, "reason": "..." }` | El cambio supera el 25% respecto del valor actual. No se aplica: revisalo y cargalo a mano. |
| 502 | `{ "error": "No se pudo actualizar la cotización" }` | dolarapi.com falló o devolvió datos inválidos. No se tocó nada. |

En n8n conviene agregar una rama que te avise (mail o WhatsApp) cuando la respuesta sea 409 o 502.

## Historial de cambios

Cada campo actualizado genera una fila en la tabla `ProductSyncLog`:

| Columna | Ejemplo |
|---|---|
| `productId` | `3f2a9c1e-…` |
| `field` | `price` · `sku` · `description` |
| `oldValue` | `18.5` |
| `newValue` | `19.9` |
| `source` | `n8n-lococo` |
| `createdAt` | `2026-11-08T12:00:00Z` |

Para consultarlo:

```sql
SELECT * FROM "ProductSyncLog" WHERE "productId" = '<id>' ORDER BY "createdAt" DESC;
```

---

## Configuración en n8n

Variables del workflow:

```
MY_PRODUCTS_URL=https://projaska.com/api/price-sync/products
MY_UPDATE_URL=https://projaska.com/api/price-sync/update
```

Credencial **Header Auth**:

- Name: `Authorization`
- Value: `Bearer <PRICE_SYNC_API_KEY>`

Flujo sugerido:

1. **HTTP Request (GET)** a `MY_PRODUCTS_URL` para traer los productos.
2. Cruzar con la lista del proveedor por `sku` o `model`.
3. Por cada diferencia, **HTTP Request (POST)** a `MY_UPDATE_URL` con `match` y `set`.
4. Tratar 404 y 409 como avisos para revisar a mano, no como errores fatales.

---

## Puesta en marcha

1. Aplicar la migración que agrega `Product.model` y `ProductSyncLog`. Hacelo **antes** de deployar el código: la app lee la columna nueva en todas las consultas de productos.
   ```bash
   npx prisma migrate deploy
   ```
2. Cargar `PRICE_SYNC_API_KEY` en Vercel (Settings → Environment Variables) y hacer redeploy.
3. Cargar el `model` en los productos que se quieran cruzar por modelo.

---

## Código

| Archivo | Qué hace |
|---|---|
| `src/app/api/price-sync/products/route.ts` | GET |
| `src/app/api/price-sync/update/route.ts` | POST |
| `src/lib/price-sync-auth.ts` | Verificación del Bearer token (`timingSafeEqual`) |
| `src/lib/validations/price-sync.ts` | Esquema Zod del body |
| `src/__tests__/api/price-sync.test.ts` | Tests |
