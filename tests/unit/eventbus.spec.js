// Tests: EventBus

import { EventBus } from '../../app/core/events/EventBus.js';
const { describe, it, assert, assertEq } = window.__test;

describe('EventBus', () => {
  it('on/emit básico', () => {
    const bus = new EventBus();
    let received = null;
    bus.on('hola', (p) => { received = p; });
    bus.emit('hola', { x: 1 });
    assertEq(received, { x: 1 });
  });

  it('múltiples listeners reciben el evento', () => {
    const bus = new EventBus();
    let a = 0, b = 0;
    bus.on('e', () => a++);
    bus.on('e', () => b++);
    bus.emit('e');
    assertEq(a, 1);
    assertEq(b, 1);
  });

  it('off desuscribe', () => {
    const bus = new EventBus();
    let count = 0;
    const fn = () => count++;
    bus.on('e', fn);
    bus.emit('e');
    bus.off('e', fn);
    bus.emit('e');
    assertEq(count, 1);
  });

  it('devuelve unsubscriber', () => {
    const bus = new EventBus();
    let count = 0;
    const unsub = bus.on('e', () => count++);
    bus.emit('e');
    unsub();
    bus.emit('e');
    assertEq(count, 1);
  });

  it('once se ejecuta una sola vez', () => {
    const bus = new EventBus();
    let count = 0;
    bus.once('e', () => count++);
    bus.emit('e');
    bus.emit('e');
    bus.emit('e');
    assertEq(count, 1);
  });

  it('error en un listener no detiene a los demás', () => {
    const bus = new EventBus();
    let ok = 0;
    bus.on('e', () => { throw new Error('boom'); });
    bus.on('e', () => ok++);
    bus.emit('e');
    assertEq(ok, 1);
  });

  it('emit sin listeners no falla', () => {
    const bus = new EventBus();
    bus.emit('nadie');
    assert(true);
  });

  it('clear(event) elimina sólo ese evento', () => {
    const bus = new EventBus();
    let a = 0, b = 0;
    bus.on('a', () => a++);
    bus.on('b', () => b++);
    bus.clear('a');
    bus.emit('a');
    bus.emit('b');
    assertEq(a, 0);
    assertEq(b, 1);
  });
});
