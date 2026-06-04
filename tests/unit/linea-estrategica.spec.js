// Tests: LineaEstrategica (entity + invariantes)

import { LineaEstrategica } from '../../app/domain/entities/LineaEstrategica.js';
const { describe, it, assert, assertEq } = window.__test;

describe('LineaEstrategica', () => {
  const sample = {
    id: 'calidad',
    nombre: 'Calidad',
    color: '#EC0677',
    icono: 'rosa',
    slideId: 'cal-avance',
    logroSlideId: 'cal-logro',
    slidePPT: '7/8',
    real: 99,
    esperado: 100,
    cumplimiento: 99,
    retos: 103,
    areas: 45,
    logros: ['Logro A', 'Logro B'],
  };

  it('construye con datos válidos', () => {
    const e = new LineaEstrategica(sample);
    assertEq(e.id, 'calidad');
    assertEq(e.nombre, 'Calidad');
    assertEq(e.real, 99);
    assertEq(e.esperado, 100);
    assertEq(e.cumplimiento.value, 99);
    assertEq(e.retos, 103);
    assertEq(e.areas, 45);
  });

  it('cumplimiento se calcula si no se pasa explícito', () => {
    const e = new LineaEstrategica({ ...sample, cumplimiento: undefined });
    assertEq(e.cumplimiento.value, 99);
  });

  it('color es un Color VO con hex correcto', () => {
    const e = new LineaEstrategica(sample);
    assertEq(e.color.hex, '#ec0677');
  });

  it('logros siempre es array', () => {
    const e = new LineaEstrategica({ ...sample, logros: undefined });
    assertEq(e.logros, []);
  });

  it('icono default si no se especifica', () => {
    const e = new LineaEstrategica({ ...sample, icono: undefined });
    assertEq(e.icono, 'default');
  });

  it('recalcular() actualiza cumplimiento desde real/esperado', () => {
    const e = new LineaEstrategica(sample);
    e.real = 80;
    e.recalcular();
    assertEq(e.cumplimiento.value, 80);
  });

  it('toPlain() devuelve un objeto plano', () => {
    const e = new LineaEstrategica(sample);
    const p = e.toPlain();
    assertEq(p.id, 'calidad');
    assertEq(p.color, '#ec0677');
    assertEq(p.cumplimiento, 99);
    assertEq(p.logros.length, 2);
  });
});
