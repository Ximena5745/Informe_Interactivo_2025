// Vista: línea estratégica (genérica para las 6).
// Usada por cal-avance, edu-avance, exp-avance, exp2-avance, to-avance, sos-avance.

import { h, render } from '../../core/render/dom.js';
import '../../components/gauge/XGauge.js';

export class LineaView {
  /**
   * @param {{ data: { linea: any, branding: any }, deps: any }} ctx
   */
  constructor({ data, deps }) {
    this.data = data;
    this.deps = deps;
  }

  async render(root) {
    const { linea, branding } = this.data;
    const textColor = linea.color.textoContraste;

    const header = h('div', { class: 'slide-header', style: { background: linea.color.hex } }, [
      h('h2', { class: `slide-header__title ${textColor === '#0F385A' ? 'slide-header__title--on-light' : ''}` }, [linea.nombre.toUpperCase()]),
    ]);

    const gauges = h('div', { class: 'gauges-row', style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' } }, [
      h('x-gauge', { value: linea.real,           label: 'Avance Real',       color: linea.color.hex }),
      h('x-gauge', { value: linea.esperado,       label: 'Esperado',          color: '#0F385A' }),
      h('x-gauge', { value: linea.cumplimiento.value, label: 'Cumplimiento',   color: linea.color.hex }),
    ]);

    const kpis = h('div', { class: 'kpis-row', style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' } }, [
      h('div', { class: 'kpi-card', style: { padding: 'var(--space-3)', background: '#f0f4f8', borderRadius: 'var(--radius-md)', textAlign: 'center' } }, [h('div', { class: 'kpi-value', style: { fontSize: 'var(--fs-2xl)', fontWeight: 'var(--fw-black)', color: linea.color.hex } }, [String(linea.retos)]), h('div', { class: 'kpi-label', style: { fontSize: 'var(--fs-xs)', textTransform: 'uppercase', fontWeight: 'var(--fw-bold)', color: 'var(--color-text-muted)' } }, ['Retos'])]),
      h('div', { class: 'kpi-card', style: { padding: 'var(--space-3)', background: '#f0f4f8', borderRadius: 'var(--radius-md)', textAlign: 'center' } }, [h('div', { class: 'kpi-value', style: { fontSize: 'var(--fs-2xl)', fontWeight: 'var(--fw-black)', color: linea.color.hex } }, [String(linea.areas)]), h('div', { class: 'kpi-label', style: { fontSize: 'var(--fs-xs)', textTransform: 'uppercase', fontWeight: 'var(--fw-bold)', color: 'var(--color-text-muted)' } }, ['Áreas'])]),
      h('div', { class: 'kpi-card', style: { padding: 'var(--space-3)', background: '#f0f4f8', borderRadius: 'var(--radius-md)', textAlign: 'center' } }, [h('div', { class: 'kpi-value', style: { fontSize: 'var(--fs-2xl)', fontWeight: 'var(--fw-black)', color: linea.color.hex } }, [linea.slidePPT || '—']), h('div', { class: 'kpi-label', style: { fontSize: 'var(--fs-xs)', textTransform: 'uppercase', fontWeight: 'var(--fw-bold)', color: 'var(--color-text-muted)' } }, ['Slide PPTX'])]),
    ]);

    const logrosBtn = h('button', {
      class: 'logros-toggle',
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': `logros-${linea.id}`,
      style: { width: '100%', padding: 'var(--space-3) var(--space-4)', background: linea.color.hex, color: textColor, borderRadius: 'var(--radius-md)', fontWeight: 'var(--fw-black)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 'var(--space-4)', cursor: 'pointer' },
    }, ['📂 Principales Logros']);

    const logrosList = h('ul', { id: `logros-${linea.id}`, class: 'logros-list', hidden: true, style: { listStyle: 'none', marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' } },
      linea.logros.map((l) => h('li', { class: 'logro-item', style: { padding: 'var(--space-3)', background: '#f0f4f8', borderLeft: `4px solid ${linea.color.hex}`, borderRadius: 'var(--radius-sm)' } }, [l]))
    );

    logrosBtn.addEventListener('click', () => {
      const expanded = logrosBtn.getAttribute('aria-expanded') === 'true';
      logrosBtn.setAttribute('aria-expanded', String(!expanded));
      logrosList.hidden = expanded;
      logrosBtn.firstChild.textContent = expanded ? '📂 Principales Logros' : '📁 Ocultar Logros';
    });

    const slide = h('section', { class: 'slide', 'aria-label': `Línea estratégica ${linea.nombre}` }, [
      header,
      h('div', { class: 'slide-body' }, [gauges, kpis, logrosBtn, logrosList]),
    ]);

    render(root, [slide]);
  }

  destroy() {}
}
