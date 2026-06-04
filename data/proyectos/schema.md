# proyectos — Maestro de proyectos estratégicos

Hoja: `proyectos`.

## Columnas

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `id` | string | Identificador (`P-001`, `P-002`, …). |
| 2 | `nombre` | string | Nombre del proyecto. |
| 3 | `linea` | enum | Línea estratégica asociada (`calidad`, `educacion`, `expansion`, `experiencia`, `transformacion`, `sostenibilidad`). |
| 4 | `avance` | número 0-100 | % de avance del proyecto. |
| 5 | `unidad` | string | Unidad responsable del proyecto. |

## Convenciones

- IDs incrementales por línea: `P-001` a `P-009` calidad, `P-010` a `P-019` educación, etc.
- 17 proyectos en total (3-4 por línea).
- `avance` debe ser entero entre 0 y 100.
