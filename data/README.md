# Carpeta `data/` — Fuentes de información

> **Esta carpeta es la única fuente de verdad del contenido del informe.**
> La aplicación (`app/`) **no contiene datos hardcoded**: consume los libros Excel de aquí.
> Edita los archivos en Excel, Google Sheets o cualquier editor de XLSX y recarga el navegador.

---

## Estructura

```
data/
├── README.md              ← este archivo
│
├── sources/               ← registry de fuentes (metadatos)
│   ├── sources.xlsx       ← qué archivo XLSX es cada fuente, qué hoja, etc.
│   ├── sources.js         ← espejo JS para carga instantánea en file://
│   └── README.md
│
├── config/                ← 1. Configuración institucional
│   ├── config.xlsx        ← branding, paleta Poli, atajos
│   ├── schema.md          ← columnas esperadas
│   └── README.md          ← cómo editar
│
├── navegacion/            ← 2. Mapa de navegación
│   ├── navegacion.xlsx
│   ├── schema.md
│   └── README.md
│
├── avance/                ← 3. Cumplimiento Kawak (6 líneas estratégicas)
│   ├── avance.xlsx
│   ├── schema.md
│   └── README.md
│
├── foda/                  ← 4. FODA institucional
│   ├── foda.xlsx
│   ├── schema.md
│   └── README.md
│
├── pestel/                ← 5. Análisis PESTEL
│   ├── pestel.xlsx
│   ├── schema.md
│   └── README.md
│
├── proyectos/             ← 6. Maestro de proyectos
│   ├── proyectos.xlsx
│   ├── schema.md
│   └── README.md
│
├── objetivos/             ← 7. CMI estratégico
│   ├── objetivos.xlsx
│   ├── schema.md
│   └── README.md
│
├── reportes/              ← 8. Histórico 2022-2024
│   ├── reportes.xlsx
│   ├── schema.md
│   └── README.md
│
└── unidades/              ← 9. Unidades organizacionales
    ├── unidades.xlsx
    ├── schema.md
    └── README.md
```

---

## ¿Cómo actualizo los datos?

### Caso 1: Cambiar un porcentaje de cumplimiento

1. Abre `data/avance/avance.xlsx` en Excel o Google Sheets.
2. Localiza la fila de la línea que quieres modificar (Calidad, Educación, etc.).
3. Cambia el valor de la columna `cumplimiento`.
4. Guarda el archivo.
5. Recarga el navegador (`F5` o `Ctrl + R`).

### Caso 2: Editar la lista de logros de una línea

1. Abre `data/avance/avance.xlsx`.
2. En la columna `logros`, los items van separados por ` | ` (espacio, pipe, espacio).
3. Edita, agrega o quita items.
4. Guarda y recarga el navegador.

### Caso 3: Cambiar la paleta institucional

1. Abre `data/config/config.xlsx`.
2. Localiza las filas de la sección `paleta_*` (una fila por color).
3. Cambia el valor hex (por ejemplo `#EC0677` → `#E91E63`).
4. Guarda y recarga.

### Caso 4: Agregar un nuevo objetivo estratégico

1. Abre `data/objetivos/objetivos.xlsx`.
2. Agrega una nueva fila con: `id`, `nombre`, `perspectiva`, `meta`, `real`, `linea`.
3. Guarda y recarga.

### Caso 5: Cambiar el menú de navegación

1. Abre `data/navegacion/navegacion.xlsx`.
2. Modifica o agrega filas (ver `schema.md` para las columnas).
3. Para agregar un slide nuevo, primero crea la vista en `app/views/`.
4. Guarda y recarga.

---

## Modos de uso

### A) Doble clic en `index.html` (file://)

- La primera vez, la app muestra una pantalla de carga.
- Sube los archivos XLSX desde tu disco. Se cachean en IndexedDB.
- Las siguientes veces, los datos vienen del caché local (instantáneo).
- Para forzar recarga: cambia un valor en el XLSX, guárdalo, y desde la app ve a *Ajustes → Limpiar caché* (pendiente) o borra el almacenamiento del sitio desde DevTools.

### B) Servidor local

```bash
# Windows
serve.bat
# o directamente
python -m http.server 8080
```

Abre `http://localhost:8080/`. La app detecta `http://` y hace `fetch()` directo del XLSX.

### C) GitHub Pages

Habilita Pages apuntando a la rama `main` y directorio raíz. La app funciona en `https://<user>.github.io/<repo>/`.

---

## ¿Cómo se carga cada fuente?

1. La app importa `data/sources/sources.js` (registry de 9 fuentes).
2. Por cada fuente, crea un `XlsxRepository` con `id`, `archivo`, `hoja`.
3. Al pedir los datos, el repositorio:
   1. Busca en IndexedDB (`pdi2025-cache/sources/<id>`). Si existe → retorna.
   2. Si no, intenta `fetch(archivo)` (funciona en HTTP/HTTPS).
   3. Si falla, la UI pide al usuario subir el archivo (modo file://).
4. Parsea el XLSX con SheetJS, guarda en IDB, retorna los datos.

---

## Validación de esquema

Cada carpeta tiene un `schema.md` con las columnas esperadas. Si agregas columnas nuevas, el adapter las ignora (no rompe). Si renombras columnas obligatorias, la app mostrará la fuente como "Pendiente" hasta corregir.

---

## Versionado

Para forzar invalidación de caché en todos los clientes:
1. Edita `data/sources/sources.xlsx` columna `descripcion` y agrega un sufijo `v2`.
2. Sube el cambio.
3. Los clientes con la versión vieja verán los datos cacheados (IDB); los nuevos los fetchean.

Para purga programática del caché: `await caches.delete('pdi2025-cache')` o botón "Limpiar caché" en la app (pendiente).

---

## Generación de los XLSX desde código

Los archivos de esta carpeta pueden regenerarse desde la base de datos institucional
ejecutando:

```bash
python scripts/generar_xlsx.py
```

(El script está en `scripts/`; usa solo la biblioteca estándar de Python.)

Para migrar a otra fuente de datos (Postgres, SharePoint, Kawak API), modifica
`sources/sources.js` y crea un nuevo adapter en `app/repositories/adapters/`.
