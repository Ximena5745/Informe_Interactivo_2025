// Web Component <x-sidebar> — botones flotantes Home/Back.
// Aplica Single Responsibility: solo gestiona los botones de navegación global.

import { h, render } from '../../core/render/dom.js';
import { announce } from '../../core/a11y/index.js';

const TEMPLATE = `
  <button id="btn-home" data-action="home" type="button"
          aria-label="Ir al inicio" title="Inicio (H)">
    <span aria-hidden="true">🏠</span>
  </button>
  <button id="btn-back" data-action="back" type="button"
          aria-label="Volver al slide anterior" title="Volver (Esc)">
    <span aria-hidden="true">←</span>
  </button>
`;

export class XSidebar extends HTMLElement {
  /**
   * @param {{ slideService: any, bus: any }} deps
   */
  constructor(deps) {
    super();
    this.deps = deps;
  }

  connectedCallback() {
    this.innerHTML = TEMPLATE;
    this.addEventListener('click', this._onClick);
    this.deps.bus.on('slide:changed', this._onSlideChanged);
    this._syncState();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.deps.bus.off('slide:changed', this._onSlideChanged);
  }

  _onClick = (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn || btn.disabled) return;
    const action = btn.dataset.action;
    if (action === 'home') {
      this.deps.slideService.goHome();
      announce('Volvió al inicio');
    } else if (action === 'back') {
      this.deps.slideService.goBack();
      announce('Volvió al slide anterior');
    }
  };

  _onSlideChanged = () => this._syncState();

  _syncState() {
    const btnHome = this.querySelector('#btn-home');
    const btnBack = this.querySelector('#btn-back');
    if (!btnHome || !btnBack) return;
    btnHome.disabled = this.deps.slideService.isAtHome();
    btnBack.disabled = !this.deps.slideService.canGoBack();
  }
}

customElements.define('x-sidebar', XSidebar);
