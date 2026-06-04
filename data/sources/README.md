# sources — Registry de fuentes

El registry declara las **9 fuentes de datos** que el `DataLoader` carga al iniciar la app.

## Archivos

- [`sources.js`](./sources.js) — módulo ES (usado por la app).
- [`sources.xlsx`](./sources.xlsx) — espejo editable (este registry vive en XLSX para mantener la regla "fuentes en XLSX").

## Cómo añadir una fuente

1. Crea la carpeta `data/<nueva-fuente>/` con `<nueva-fuente>.xlsx` + `schema.md` + `README.md`.
2. Añade una fila en `sources.xlsx` y otra en `sources.js` con la misma información.
3. La app detectará la nueva fuente en el siguiente arranque.

## Reglas

- `id` único en minúsculas.
- `archivo` = ruta relativa a la raíz de la app, formato `../data/<fuente>/<fuente>.xlsx`.
- `hoja` = nombre exacto de la hoja dentro del XLSX.
- `obligatorio` = `true` si la app no debe iniciar sin esta fuente.

## Ver también

- [`schema.md`](./schema.md) — definición de columnas.
- [`../README.md`](../README.md) — guía raíz de la carpeta `data/`.
