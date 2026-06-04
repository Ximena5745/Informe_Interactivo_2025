# reportes — Reportes anuales e histórico

Hoja: `reportes` (hoja principal) + hoja `kpis` embebida.

## Hoja `reportes` — Historial

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `anio` | entero | Año del reporte. |
| 2 | `planes` | entero | Cantidad de planes anuales de retos en ese año. |
| 3 | `cumplimiento` | número 0-100 | % de cumplimiento promedio. |

## Hoja `kpis` — KPIs institucionales

| Clave | Valor | Significado |
|-------|-------|-------------|
| `anioActual` | 2025 | Año del reporte vigente. |
| `planes` | 83 | Planes en el año actual. |
| `cumplimientoPromedio` | 98 | Cumplimiento promedio actual. |
| `lineasEstrategicas` | 6 | Cantidad de líneas estratégicas activas. |
| `objetivosEstrategicos` | 12 | Cantidad de objetivos estratégicos (CMI). |

## Edición

- Para actualizar el año actual: edita `kpis.anioActual` y los `planes`/`cumplimiento` correspondientes.
- Para añadir un año al historial: nueva fila en la primera sección con `anio`, `planes`, `cumplimiento`.
