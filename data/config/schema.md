# `config/config.xlsx` — Configuración institucional

Hoja: **`config`**

| Sección | Columnas | Descripción |
|---------|----------|-------------|
| `general` | `tenant`, `periodo`, `versionInforme` | Identidad del informe |
| `branding` | `nombre`, `subtitulo`, `logo`, `diagramaLineas` | Marca visual |
| `paleta` | `navy`, `cyan`, `pink`, `green`, `yellow`, `teal` | Colores institucionales (hex) |
| `paleta_*_rol` | `valor` | Rol de cada color (referencia) |
| `tipografia` | `familia`, `pesos`, `fuente` | Tipografía |
| `atajos_*` | `valor` | Atajos de teclado |

## Formato del archivo

- Una sola hoja llamada `config`.
- Primera columna `seccion` agrupa las filas por categoría.
- Segunda columna `clave` identifica el campo.
- Tercera columna `valor` contiene el dato.

## Ejemplo de filas

```
seccion          | clave              | valor
─────────────────────────────────────────────────────────────
general          | tenant             | politecnico-grancolombiano
branding         | logo               | ./public/img/brand/logo-poli.jpg
paleta           | pink               | #EC0677
atajos_home      | valor              | h,H
```

## Consumido por

- `app/services/DataLoader.js` → `XlsxConfigRepository`
- `app/app.config.js` → branding, atajos, paleta
- `app/styles/tokens.css` (los colores se cargan también desde CSS como fallback)
