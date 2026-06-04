// Regla de negocio: ranking de líneas por cumplimiento (descendente).

/**
 * @param {import('../entities/LineaEstrategica.js').LineaEstrategica[]} lineas
 */
export function rankingLineas(lineas) {
  return [...lineas].sort((a, b) => b.cumplimiento.value - a.cumplimiento.value);
}
