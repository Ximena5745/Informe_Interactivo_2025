// Vista genérica de infografía "*-logro".
// Carga perezosa de la imagen (lazy).

import { h, render } from '../../core/render/dom.js';

export class LogroView {
  constructor({ data, deps }) {
    this.data = data;
    this.deps = deps;
  }

  async render(root) {
    const { slide } = this.data;

    const header = h('div', {
      class: 'slide-header',
      style: { background: slide.colorHeader || '#0F385A' },
    }, [
      h('h2', {
        class: `slide-header__title ${(slide.colorHeader || '#0F385A') === '#0F385A' ? 'slide-header__title--on-light' : ''}`,
      }, [slide.titulo]),
    ]);

    const imgContainer = h('div', {
      style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-3)', overflow: 'hidden', minHeight: 0 },
    }, [
      h('img', {
        src: slide.imagen,
        alt: `Infografía de logros de ${slide.titulo}`,
        loading: 'lazy',
        decoding: 'async',
        style: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
      }),
    ]);

    const slideEl = h('section', { class: 'slide', 'aria-label': slide.titulo }, [header, imgContainer]);
    render(root, [slideEl]);
  }

  destroy() {}
}
