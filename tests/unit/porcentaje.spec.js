// Tests: Porcentaje (value object)

import { Porcentaje } from '../../app/domain/value-objects/Porcentaje.js';
const { describe, it, assert, assertEq, assertThrows } = window.__test;

describe('Porcentaje', () => {
  it('clampa valores a [0, 100]', () => {
    assertEq(new Porcentaje(-10).value, 0);
    assertEq(new Porcentaje(0).value, 0);
    assertEq(new Porcentaje(50).value, 50);
    assertEq(new Porcentaje(100).value, 100);
    assertEq(new Porcentaje(150).value, 100);
  });

  it('acepta strings numéricos', () => {
    assertEq(new Porcentaje('75').value, 75);
  });

  it('rechaza valores no numéricos', () => {
    assertThrows(() => new Porcentaje('abc'), undefined, 'debe rechazar string no numérico');
    assertThrows(() => new Porcentaje(NaN), undefined, 'debe rechazar NaN');
  });

  it('estado: ok ≥95, alerta ≥85, crítico <85', () => {
    assertEq(new Porcentaje(100).estado, 'ok');
    assertEq(new Porcentaje(95).estado, 'ok');
    assertEq(new Porcentaje(90).estado, 'alerta');
    assertEq(new Porcentaje(85).estado, 'alerta');
    assertEq(new Porcentaje(50).estado, 'critico');
    assertEq(new Porcentaje(0).estado, 'critico');
  });

  it('cumple true solo en 100', () => {
    assertEq(new Porcentaje(99).cumple, false);
    assertEq(new Porcentaje(100).cumple, true);
  });

  it('toString y toFormatted devuelven %', () => {
    assertEq(new Porcentaje(73).toString(), '73%');
    assertEq(new Porcentaje(73).toFormatted(), '73%');
  });

  it('equals compara por valor', () => {
    assert(new Porcentaje(50).equals(new Porcentaje(50)));
    assert(!new Porcentaje(50).equals(new Porcentaje(51)));
  });

  it('toGaugeDasharray produce par filled/empty', () => {
    const dash = new Porcentaje(50).toGaugeDasharray(100);
    assertEq(dash.split(' ').length, 2);
    assertEq(parseFloat(dash.split(' ')[0]), 50);
    assertEq(parseFloat(dash.split(' ')[1]), 50);
  });

  it('from es factory', () => {
    assert(Porcentaje.from(42) instanceof Porcentaje);
  });
});
