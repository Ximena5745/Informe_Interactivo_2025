// Tests: Store (reactivo)

import { Store } from '../../app/core/store/Store.js';
const { describe, it, assert, assertEq } = window.__test;

describe('Store', () => {
  it('get devuelve el valor inicial', () => {
    const s = new Store({ x: 1 });
    assertEq(s.get('x'), 1);
  });

  it('set con string asigna una clave', () => {
    const s = new Store();
    s.set('y', 42);
    assertEq(s.get('y'), 42);
  });

  it('set con objeto aplica patch', () => {
    const s = new Store();
    s.set({ a: 1, b: 2 });
    assertEq(s.get('a'), 1);
    assertEq(s.get('b'), 2);
  });

  it('subscribe recibe valor nuevo y previo', () => {
    const s = new Store({ n: 0 });
    const log = [];
    s.subscribe('n', (v, p) => log.push([v, p]));
    s.set('n', 1);
    s.set('n', 2);
    assertEq(log, [[1, 0], [2, 1]]);
  });

  it('subscribe devuelve unsubscriber', () => {
    const s = new Store();
    let count = 0;
    const u = s.subscribe('x', () => count++);
    s.set('x', 1);
    u();
    s.set('x', 2);
    assertEq(count, 1);
  });

  it('suscripción a clave inexistente: no falla', () => {
    const s = new Store();
    s.subscribe('nada', () => {});
    assert(true);
  });
});
