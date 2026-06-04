# avance — Avance de cumplimiento (Kawak)

Hoja: `avance` (hoja principal) + hoja `global` embebida con totales.

## Columnas

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `id` | string | Identificador único de la línea estratégica (`calidad`, `educacion`, `expansion`, `experiencia`, `transformacion`, `sostenibilidad`). |
| 2 | `nombre` | string | Nombre legible de la línea. |
| 3 | `color` | hex | Color principal de la línea para tarjeta, gauge y badge. |
| 4 | `icono` | string | Nombre del icono a usar (`rosa`, `graduacion`, `mapa`, `estrella`, `engranaje`, `hoja`). |
| 5 | `slideId` | string | ID de la slide de detalle (`cal-avance`, `edu-avance`, etc.). |
| 6 | `logroSlideId` | string | ID de la slide de logros para esta línea. |
| 7 | `slidePPT` | string | Referencia al slide original del PPT Kawak (`7/8`, `9/10`, etc.). |
| 8 | `real` | número 0-100 | % real de cumplimiento. |
| 9 | `esperado` | número 0-100 | % esperado (normalmente 100). |
| 10 | `cumplimiento` | número 0-100 | Cálculo final (real/esperado × 100). |
| 11 | `retos` | entero | Número de retos asociados a la línea. |
| 12 | `areas` | entero | Número de áreas/dependencias participantes. |
| 13 | `logros` | string pipe-separated | Logros separados por ` \| ` (espacio pipe espacio). |

## Hoja `global`

| Clave | Valor | Significado |
|-------|-------|-------------|
| `fuente` | Kawak — Corte diciembre 2025 | Origen del reporte. |
| `cumplimiento` | 94 | Cumplimiento global (promedio ponderado). |
| `retos` | 374 | Total de retos. |
| `areas` | 201 | Total de áreas. |

## Edición

- Para actualizar el % real: cambia la columna `real` y deja que la app recalcule `cumplimiento`.
- Para añadir un logro: appende al final de `logros` separando con ` | `.
- Para añadir una línea estratégica: añade fila con `id` único y registra en `navegacion/navegacion.xlsx` + `navegacion.js` (slider).
