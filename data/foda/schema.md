# foda — FODA institucional 2025

Hoja: `foda`.

## Columnas

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `cuadrante` | enum | `fortalezas`, `oportunidades`, `debilidades`, `amenazas`. |
| 2 | `orden` | entero 1-N | Orden dentro del cuadrante (1 = primero). |
| 3 | `item` | string | Descripción del ítem FODA. |

## Convenciones

- 7 ítems por cuadrante (28 totales) refleja la lectura institucional 2025.
- Mantén el `orden` correlativo por cuadrante si los reorganizas.
- Cambios mínimos: 1 ítem = 1 fila; evita duplicar.

## Edición

- Para reordenar: reasigna los `orden` dentro del cuadrante.
- Para añadir: nueva fila con `orden = max+1` del cuadrante.
- Para eliminar: borra la fila completa (no dejar huecos).
