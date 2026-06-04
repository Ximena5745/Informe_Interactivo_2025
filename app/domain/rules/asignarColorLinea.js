// Regla de negocio: asigna color de marca según id de línea.
// Aplica Open/Closed: agregar una línea nueva no requiere tocar esta función,
// solo agregarla al config.json (data-driven).

const PALETA_POR_ID = {
  calidad: '#EC0677',
  educacion: '#0F385A',
  expansion: '#FBAF17',
  experiencia: '#1FB2DE',
  transformacion: '#15BECE',
  sostenibilidad: '#A6CE38',
};

/**
 * @param {string} lineaId
 * @param {Record<string,{hex:string}>} [paleta]
 * @returns {string} hex color
 */
export function asignarColorLinea(lineaId, paleta = {}) {
  const merged = { ...PALETA_POR_ID, ...Object.fromEntries(
    Object.entries(paleta).map(([k, v]) => [k, v.hex])
  )};
  return merged[lineaId] || '#0F385A';
}
