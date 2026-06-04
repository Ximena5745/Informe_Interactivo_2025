# unidades — Unidades organizacionales

Esta fuente alimenta la slide **Unidad – Área** con el mapa institucional de dependencias.

## Cómo editar

1. Abre `unidades.xlsx`.
2. Para añadir una unidad: nueva fila con `id` único, `nombre`, `vicerrectoria` (puede ser vacío), `color`.
3. `vicerrectoria` debe referenciar un `id` existente de la misma tabla o quedar vacío.
4. Guarda.

## Estructura

- **Top-level** (5): Rectoría, Vicerrectorías, Planeación, Tecnología.
- **Sub-unidades** (5): Bienestar, Calidad, Educación Continua, Gestión Ambiental, etc.

## Ver también

- [`schema.md`](./schema.md) — definición de columnas.
