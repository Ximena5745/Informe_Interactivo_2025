// Tests: calcularCumplimiento (regla pura)

import { calcularCumplimiento } from '../../app/domain/rules/calcularCumplimiento.js';
import { Porcentaje } from '../../app/domain/value-objects/Porcentaje.js';
const { describe, it, assert, assertEq, assertThrows } = window.__test;

describe('calcularCumplimiento', () => {
  it('caso normal: real=99, esperado=100 → 99%', () => {
    const c = calcularCumplimiento(99, 100);
    assert(c instanceof Porcentaje);
    assertEq(c.value, 99);
  });

  it('sobrerealización: real=110, esperado=100 → clamp 100', () => {
    assertEq(calcularCumplimiento(110, 100).value, 100);
  });

  it('subrealización: real=50, esperado=100 → 50', () => {
    assertEq(calcularCumplimiento(50, 100).value, 50);
  });

  it('esperado=0 lanza error', () => {
    assertThrows(() => calcularCumplimiento(50, 0), undefined, 'debe rechazar esperado=0');
  });

  it('esperado negativo lanza error', () => {
    assertThrows(() => calcularCumplimiento(50, -10), undefined);
  });

  it('acepta strings numéricos', () => {
    assertEq(calcularCumplimiento('50', '100').value, 50);
  });
});
