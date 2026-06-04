# sources — Registry de fuentes

Hoja: `fuentes`.

## Columnas

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `id` | string | Identificador único de la fuente (usado por `DataLoader`). |
| 2 | `nombre` | string | Nombre legible. |
| 3 | `archivo` | string path | Ruta relativa al XLSX (`../data/<fuente>/<fuente>.xlsx`). |
| 4 | `hoja` | string | Nombre de la hoja a leer. |
| 5 | `obligatorio` | 0/1 | 1 = la app falla sin esta fuente; 0 = opcional. |
| 6 | `descripcion` | string | Descripción breve del propósito de la fuente. |

## Edición

> ⚠️ Cualquier cambio en `sources` debe sincronizarse con [`sources.js`](./sources.js).

1. Edita una fila o añade una nueva.
2. Actualiza `sources.js` con el mismo `id`, `archivo`, `hoja` y `obligatorio`.
3. Asegúrate de que el XLSX exista en la ruta indicada antes de guardar.

## Reglas de validación

- `id` debe ser único y en minúsculas.
- `archivo` siempre empieza con `../data/`.
- `obligatorio=1` requiere que la app no pueda iniciar sin la fuente.
