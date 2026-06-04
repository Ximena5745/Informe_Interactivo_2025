# navegacion — Mapa de navegación

Esta fuente define **qué slides existen** y en qué orden aparecen. Es la columna vertebral del informe.

## Cómo editar

1. Abre `navegacion.xlsx`.
2. Cada fila = un slide del informe.
3. Reordena filas = reordena el sidebar.
4. Cambia `layout` para definir qué vista se renderiza.
5. Para añadir un slide nuevo, primero crea la vista en `app/views/` y registra el `id` aquí.
6. Guarda.

## Layouts soportados

| `layout` | Vista | Campos extra requeridos |
|----------|-------|-------------------------|
| `home` | HomeView (slide de inicio) | — |
| `linea` | LineaView (detalle de línea estratégica) | `lineaId` |
| `logro` | LogroView (imagen de logro) | `imagen` |
| `foda` | FODAView | — |
| `pestel` | PESTELView | — |
| `avances` | AvanceGeneralView | — |
| `proyectos` | ProyectosView | — |
| `objetivos` | ObjetivosView | — |
| `unidades` | UnidadesView | — |
| `balance` | BalanceView | — |
| `orgullosamente` | OrgullosamenteView | — |

## Reglas

- `id` único, kebab-case (`cal-avance`, `edu-logro`).
- `id=home` debe existir (es el inicio).
- `lineaId` referencia un `id` válido de `avance/avance.xlsx`.
- `imagen` es ruta relativa a `app/` (ej. `./public/img/logros/...jpg`).

## Ver también

- [`schema.md`](./schema.md) — definición de columnas.
- [`../sources/sources.js`](../sources/sources.js) — declara esta fuente como `obligatorio: true`.
