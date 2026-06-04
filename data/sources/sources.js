// Registry de fuentes de información (XLSX).
// Cada fuente = una carpeta en /data/ con su <fuente>.xlsx + schema.md + README.md.
//
// Este módulo se importa en runtime; es la "constante" que la app necesita para
// saber qué XLSX cargar. Para añadir/renombrar una fuente, modifica este archivo
// Y crea la carpeta correspondiente en /data/.

export const sources = [
  {
    id: 'config',
    nombre: 'Configuración institucional',
    archivo: '../data/config/config.xlsx',
    hoja: 'config',
    obligatorio: true,
    descripcion: 'Branding, paleta, tipografía, atajos',
  },
  {
    id: 'navegacion',
    nombre: 'Mapa de navegación',
    archivo: '../data/navegacion/navegacion.xlsx',
    hoja: 'navegacion',
    obligatorio: true,
    descripcion: 'Lista de slides (id, título, layout, ruta)',
  },
  {
    id: 'avance',
    nombre: 'Avance de cumplimiento (Kawak)',
    archivo: '../data/avance/avance.xlsx',
    hoja: 'avance',
    obligatorio: true,
    descripcion: 'Cumplimiento por línea estratégica (datos Kawak)',
  },
  {
    id: 'foda',
    nombre: 'FODA institucional',
    archivo: '../data/foda/foda.xlsx',
    hoja: 'foda',
    obligatorio: false,
    descripcion: 'Fortalezas, Oportunidades, Debilidades, Amenazas',
  },
  {
    id: 'pestel',
    nombre: 'Análisis PESTEL',
    archivo: '../data/pestel/pestel.xlsx',
    hoja: 'pestel',
    obligatorio: false,
    descripcion: 'Categorías PESTEL con sus items',
  },
  {
    id: 'proyectos',
    nombre: 'Maestro de proyectos',
    archivo: '../data/proyectos/proyectos.xlsx',
    hoja: 'proyectos',
    obligatorio: true,
    descripcion: 'Listado de proyectos estratégicos con avance',
  },
  {
    id: 'objetivos',
    nombre: 'Objetivos estratégicos (CMI)',
    archivo: '../data/objetivos/objetivos.xlsx',
    hoja: 'objetivos',
    obligatorio: true,
    descripcion: 'Cuadro de Mando Integral',
  },
  {
    id: 'reportes',
    nombre: 'Reportes anuales',
    archivo: '../data/reportes/reportes.xlsx',
    hoja: 'historial',
    obligatorio: false,
    descripcion: 'Histórico de cumplimiento 2022-2024 (kpis en sección 2)',
  },
  {
    id: 'unidades',
    nombre: 'Unidades organizacionales',
    archivo: '../data/unidades/unidades.xlsx',
    hoja: 'unidades',
    obligatorio: false,
    descripcion: 'Unidades, vicerrectorías y áreas',
  },
];

export default sources;
