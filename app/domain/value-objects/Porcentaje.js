// Value Object Porcentaje.
// Aplica Single Responsibility y validaciones puras (sin I/O).

export class Porcentaje {
  /**
   * @param {number} value
   */
  constructor(value) {
    const n = Number(value);
    if (Number.isNaN(n)) throw new Error(`Porcentaje inválido: ${value}`);
    this._value = Math.max(0, Math.min(100, n));
  }

  get value() {
    return this._value;
  }

  get cumple() {
    return this._value >= 100;
  }

  /** Color sugerido según rango (verde, amarillo, rojo). */
  get estado() {
    if (this._value >= 95) return 'ok';
    if (this._value >= 85) return 'alerta';
    return 'critico';
  }

  /** @param {number} factor 0..1 */
  toGaugeDasharray(circumference = 2 * Math.PI * 38) {
    const filled = (this._value / 100) * circumference;
    return `${filled} ${circumference - filled}`;
  }

  toString() {
    return `${this._value}%`;
  }

  toFormatted() {
    return `${this._value}%`;
  }

  /**
   * @param {Porcentaje} other
   */
  equals(other) {
    return other instanceof Porcentaje && other._value === this._value;
  }

  static from(value) {
    return new Porcentaje(value);
  }
}
