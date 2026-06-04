// Value Object Color: hex + cálculo de contraste WCAG 2.1.

function hexToRgb(hex) {
  const m = String(hex).trim().replace(/^#/, '').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) throw new Error(`Color hex inválido: ${hex}`);
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function srgbToLinear(c) {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export class Color {
  /**
   * @param {string} hex
   */
  constructor(hex) {
    this._hex = String(hex).trim().toLowerCase();
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(this._hex)) {
      throw new Error(`Color inválido: ${hex}`);
    }
  }

  get hex() {
    return this._hex;
  }

  /** @returns {number} luminancia relativa 0-1 */
  get luminancia() {
    return luminance(this._hex);
  }

  /**
   * Devuelve el color de texto (negro o blanco) con mejor contraste WCAG.
   * @returns {string} "#0F385A" o "#FFFFFF"
   */
  get textoContraste() {
    const L1 = this.luminancia;
    const blanco = 1.0;
    const navy = 0.0632; // luminancia de #0F385A
    const c1 = (Math.max(L1, blanco) + 0.05) / (Math.min(L1, blanco) + 0.05);
    const c2 = (Math.max(L1, navy) + 0.05) / (Math.min(L1, navy) + 0.05);
    return c2 > c1 ? '#0F385A' : '#FFFFFF';
  }

  toString() {
    return this._hex;
  }
}
