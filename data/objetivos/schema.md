# objetivos — Objetivos estratégicos (CMI)

Hoja: `objetivos`.

## Columnas

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `id` | string | Identificador (`OE-01` a `OE-12`). |
| 2 | `nombre` | string | Nombre del objetivo estratégico. |
| 3 | `perspectiva` | enum | Perspectiva CMI: `Financiera`, `Clientes/Mercado`, `Procesos internos`, `Aprendizaje`. |
| 4 | `meta` | número 0-100 | % meta del objetivo. |
| 5 | `real` | número 0-100 | % real alcanzado. |
| 6 | `linea` | enum | Línea estratégica: `calidad`, `educacion`, `expansion`, `experiencia`, `transformacion`, `sostenibilidad`. |

## Convenciones

- 12 objetivos en total (2 por línea estratégica).
- IDs `OE-01` a `OE-12` correlativos.
- `meta` es típicamente 100; `real` refleja el avance del año.
