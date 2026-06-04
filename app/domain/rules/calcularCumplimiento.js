// Regla de negocio: calcula el cumplimiento dado real y esperado.
// Aplica SRP: pura, sin I/O, sin estado.

import { Porcentaje } from '../value-objects/Porcentaje.js';

/**
 * @param {number} real
 * @param {number} esperado
 * @returns {Porcentaje}
 */
export function calcularCumplimiento(real, esperado) {
  const r = Number(real);
  const e = Number(esperado);
  if (!Number.isFinite(r) || !Number.isFinite(e) || e <= 0) {
    throw new Error(`calcularCumplimiento: parámetros inválidos (real=${real}, esperado=${esperado})`);
  }
  return new Porcentaje((r / e) * 100);
}
