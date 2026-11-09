-- Data migration: quita espacios (y tabs/saltos de línea) al principio y al final de los textos
-- que se cargan desde el admin. No cambia el esquema ni "updatedAt".
-- Solo toca filas que tienen espacios de más.

-- Campos únicos: se recortan solo si el valor recortado no choca con otra fila
-- (incluidas las borradas). Los que chocan quedan como están y hay que resolverlos a mano.
UPDATE "Product" p SET "sku" = regexp_replace(p."sku", '^\s+|\s+$', '', 'g')
WHERE p."sku" <> regexp_replace(p."sku", '^\s+|\s+$', '', 'g')
  AND NOT EXISTS (SELECT 1 FROM "Product" o WHERE o."id" <> p."id" AND regexp_replace(o."sku", '^\s+|\s+$', '', 'g') = regexp_replace(p."sku", '^\s+|\s+$', '', 'g'));

UPDATE "Kit" k SET "sku" = regexp_replace(k."sku", '^\s+|\s+$', '', 'g')
WHERE k."sku" <> regexp_replace(k."sku", '^\s+|\s+$', '', 'g')
  AND NOT EXISTS (SELECT 1 FROM "Kit" o WHERE o."id" <> k."id" AND regexp_replace(o."sku", '^\s+|\s+$', '', 'g') = regexp_replace(k."sku", '^\s+|\s+$', '', 'g'));

UPDATE "User" u SET "username" = regexp_replace(u."username", '^\s+|\s+$', '', 'g')
WHERE u."username" <> regexp_replace(u."username", '^\s+|\s+$', '', 'g')
  AND NOT EXISTS (SELECT 1 FROM "User" o WHERE o."id" <> u."id" AND regexp_replace(o."username", '^\s+|\s+$', '', 'g') = regexp_replace(u."username", '^\s+|\s+$', '', 'g'));

-- Product: modelo y marca vacíos pasan a NULL, igual que al guardar desde el formulario.
UPDATE "Product" SET
  "model"       = NULLIF(regexp_replace("model", '^\s+|\s+$', '', 'g'), ''),
  "brand"       = NULLIF(regexp_replace("brand", '^\s+|\s+$', '', 'g'), ''),
  "name"        = regexp_replace("name", '^\s+|\s+$', '', 'g'),
  "description" = regexp_replace("description", '^\s+|\s+$', '', 'g'),
  "imageUrl"    = regexp_replace("imageUrl", '^\s+|\s+$', '', 'g'),
  "category"    = regexp_replace("category", '^\s+|\s+$', '', 'g')
WHERE "model" ~ '^\s|\s$' OR "brand" ~ '^\s|\s$' OR "model" = '' OR "brand" = ''
   OR "name" ~ '^\s|\s$' OR "description" ~ '^\s|\s$' OR "imageUrl" ~ '^\s|\s$' OR "category" ~ '^\s|\s$';

UPDATE "Kit" SET
  "name"        = regexp_replace("name", '^\s+|\s+$', '', 'g'),
  "description" = regexp_replace("description", '^\s+|\s+$', '', 'g'),
  "imageUrl"    = regexp_replace("imageUrl", '^\s+|\s+$', '', 'g')
WHERE "name" ~ '^\s|\s$' OR "description" ~ '^\s|\s$' OR "imageUrl" ~ '^\s|\s$';

UPDATE "Customer" SET
  "name"    = regexp_replace("name", '^\s+|\s+$', '', 'g'),
  "email"   = regexp_replace("email", '^\s+|\s+$', '', 'g'),
  "phone"   = regexp_replace("phone", '^\s+|\s+$', '', 'g'),
  "address" = regexp_replace("address", '^\s+|\s+$', '', 'g'),
  "notes"   = regexp_replace("notes", '^\s+|\s+$', '', 'g')
WHERE "name" ~ '^\s|\s$' OR "email" ~ '^\s|\s$' OR "phone" ~ '^\s|\s$' OR "address" ~ '^\s|\s$' OR "notes" ~ '^\s|\s$';

UPDATE "Expense" SET "description" = regexp_replace("description", '^\s+|\s+$', '', 'g'), "notes" = regexp_replace("notes", '^\s+|\s+$', '', 'g')
WHERE "description" ~ '^\s|\s$' OR "notes" ~ '^\s|\s$';

UPDATE "RecurringExpense" SET "description" = regexp_replace("description", '^\s+|\s+$', '', 'g'), "notes" = regexp_replace("notes", '^\s+|\s+$', '', 'g')
WHERE "description" ~ '^\s|\s$' OR "notes" ~ '^\s|\s$';

UPDATE "Order" SET "notes" = regexp_replace("notes", '^\s+|\s+$', '', 'g') WHERE "notes" ~ '^\s|\s$';

UPDATE "StockMovement" SET "reason" = regexp_replace("reason", '^\s+|\s+$', '', 'g') WHERE "reason" ~ '^\s|\s$';
