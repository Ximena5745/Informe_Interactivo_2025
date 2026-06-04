// Tests: Color (value object con WCAG)

import { Color } from '../../app/domain/value-objects/Color.js';
const { describe, it, assert, assertEq, assertThrows } = window.__test;

describe('Color', () => {
  it('acepta hex 6 dígitos', () => {
    const c = new Color('#EC0677');
    assertEq(c.hex, '#ec0677');
  });

  it('acepta hex 3 dígitos y los expande', () => {
    const c = new Color('#F0A');
    assertEq(c.hex, '#f0a');
  });

  it('rechaza hex inválido', () => {
    assertThrows(() => new Color('rojo'), undefined, 'debe rechazar string no hex');
    assertThrows(() => new Color('#ZZZZZZ'), undefined, 'debe rechazar caracteres inválidos');
  });

  it('luminancia está entre 0 y 1', () => {
    const c = new Color('#FFFFFF');
    const l = c.luminancia;
    assert(l > 0.9 && l <= 1, `blanco debe tener luminancia ~1, fue ${l}`);
    const n = new Color('#0F385A');
    const ln = n.luminancia;
    assert(ln >= 0 && ln < 0.1, `navy debe tener luminancia ~0.06, fue ${ln}`);
  });

  it('textoContraste devuelve blanco o navy', () => {
    const claro = new Color('#FBAF17').textoContraste;
    const oscuro = new Color('#0F385A').textoContraste;
    assert(claro === '#0F385A' || claro === '#FFFFFF', `claro: ${claro}`);
    assert(oscuro === '#0F385A' || oscuro === '#FFFFFF', `oscuro: ${oscuro}`);
  });

  it('color claro (amarillo) → texto navy', () => {
    const t = new Color('#FBAF17').textoContraste;
    assertEq(t, '#0F385A');
  });

  it('color oscuro (navy) → texto blanco', () => {
    const t = new Color('#0F385A').textoContraste;
    assertEq(t, '#FFFFFF');
  });
});
