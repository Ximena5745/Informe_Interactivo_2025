# pestel — Análisis PESTEL

Hoja: `pestel`.

## Columnas

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `letra` | enum | `P` (Político), `E` (Económico), `S` (Social), `T` (Tecnológico), `E` (Ecológico), `L` (Legal). |
| 2 | `nombre` | string | Nombre completo del factor. |
| 3 | `color` | hex | Color asociado para resaltado visual. |
| 4 | `orden` | entero 1-N | Orden dentro de la categoría. |
| 5 | `item` | string | Descripción del ítem PESTEL. |

## Convenciones

- 6 ítems por categoría (36 totales).
- La letra `E` se usa dos veces (Económico y Ecológico) — el `color` los diferencia.
- La categoría **Ecológico** (no Político) usa `#FBAF17` (amarillo); Económico usa `#1FB2DE` (cyan).
