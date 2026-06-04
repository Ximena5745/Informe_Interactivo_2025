# unidades — Unidades organizacionales

Hoja: `unidades`.

## Columnas

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `id` | string | Identificador (`RECT`, `VACA`, `VEST`, etc.). |
| 2 | `nombre` | string | Nombre oficial de la unidad. |
| 3 | `vicerrectoria` | string | Vicerrectoría padre (vacío si es top-level). |
| 4 | `color` | hex | Color institucional de la unidad. |

## Convenciones

- IDs en mayúsculas, sin espacios (4-5 caracteres).
- `vicerrectoria` referencia un `id` de la misma tabla; vacío para top-level.
- 10 unidades en total.
