# `navegacion/navegacion.xlsx` — Mapa de navegación

Hoja: **`navegacion`**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | string (kebab-case) | Identificador único del slide (ej. `cal-avance`) |
| `titulo` | string | Título visible |
| `layout` | string | Tipo de vista: `home`, `linea`, `logro`, `foda`, `pestel`, `ciclo`, etc. |
| `dataTitle` | string | Título normalizado (sin acentos, mayúsculas) |
| `colorHeader` | hex (opcional) | Color de la cabecera del slide |
| `lineaId` | string (opcional) | FK a `avance.xlsx` (`calidad`, `educacion`, etc.) |
| `imagen` | ruta (opcional) | Imagen de fondo (para `layout=logro`) |
| `origen` | string | Nombre de la fuente que alimenta el slide |

## Reglas

- El `id` debe ser único.
- El `id` `home` siempre existe y es el inicio.
- Para `layout=linea` se requiere `lineaId`.
- Para `layout=logro` se requiere `imagen`.

## Consumido por

- `app/services/DataLoader.js` → `XlsxNavegacionRepository`
- `app/app.config.js` → `Router`, `SlideService`, `HomeView`, `LineaView`, `LogroView`
