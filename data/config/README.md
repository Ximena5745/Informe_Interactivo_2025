# Fuente: `config` — Configuración institucional

**Archivo**: `data/config/config.xlsx`
**Hoja**: `config`
**Obligatoria**: sí

## ¿Qué contiene?

Branding, paleta de colores institucional, tipografía, atajos de teclado y rutas a los logos.

## ¿Cómo la edito?

1. Abre el archivo en Excel o Google Sheets.
2. Modifica las filas que necesites (ver [`schema.md`](./schema.md) para el detalle de columnas).
3. Guarda y recarga el navegador.

## Cambios comunes

- **Cambiar el logo de la página principal**: edita la fila `branding` / `logo`. La ruta es relativa a la raíz del proyecto.
- **Cambiar un color institucional**: edita la fila `paleta` / `<nombre>`. Usa formato hex `#RRGGBB`.
- **Cambiar los atajos de teclado**: edita `atajos_home` y `atajos_atras`. Los valores van separados por coma.

## Importante

- No cambies el nombre de la hoja (`config`).
- No elimines las filas de la sección `general`: la app las necesita para identificar el informe.
- Si agregas un color nuevo, recuerda documentarlo en `schema.md`.
