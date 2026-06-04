// Web Component <x-linea-card> — tarjeta clickeable de una línea estratégica.
// Usada en home (7 botones izq/der) y menú de logros.

import { h, render } from '../../core/render/dom.js';

const ICONOS = {
  rosa:        `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="2"/><path d="M20 6v28M6 20h28" stroke="currentColor" stroke-width="1.5"/></svg>`,
  graduacion:  `<svg viewBox="0 0 40 40"><ellipse cx="20" cy="13" rx="10" ry="7" stroke="currentColor" stroke-width="2"/><path d="M10 20c0 6 4 10 10 10s10-4 10-10" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="20" r="3" fill="currentColor"/></svg>`,
  mapa:        `<svg viewBox="0 0 40 40"><path d="M6 12l10-4 8 4 10-4v20l-10 4-8-4-10 4z" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
  estrella:    `<svg viewBox="0 0 40 40"><circle cx="14" cy="15" r="5" stroke="currentColor" stroke-width="2"/><circle cx="26" cy="15" r="5" stroke="currentColor" stroke-width="2"/><path d="M8 30c2-5 7-8 12-8s10 3 12 8" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
  engranaje:   `<svg viewBox="0 0 40 40"><rect x="8" y="8" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2"/><rect x="22" y="8" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2"/><rect x="8" y="22" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2"/><rect x="22" y="22" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2"/><path d="M18 13h4M13 18v4M27 18v4M22 27h-4" stroke="currentColor" stroke-width="1.5"/></svg>`,
  hoja:        `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="13" stroke="currentColor" stroke-width="2"/><path d="M7 20h26" stroke="currentColor" stroke-width="1.5"/><path d="M20 7C20 7 12 13 12 20s8 13 8 13" stroke="currentColor" stroke-width="1.5"/><path d="M20 7c0 0 8 6 8 13s-8 13-8 13" stroke="currentColor" stroke-width="1.5"/></svg>`,
  default:     `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="2"/></svg>`,
};

export class XLineaCard extends HTMLElement {
  static observedAttributes = ['label', 'color', 'icono', 'size', 'target'];

  connectedCallback() {
    this._render();
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKey);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKey);
  }

  attributeChangedCallback() {
    if (this.isConnected) this._render();
  }

  _onClick = (e) => {
    if (e.target.closest('button')) return;
    this._navigate();
  };

  _onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._navigate();
    }
  };

  _navigate() {
    const target = this.getAttribute('target');
    if (!target) return;
    this.dispatchEvent(
      new CustomEvent('navigate', { detail: { target }, bubbles: true, composed: true })
    );
  }

  _render() {
    const label = this.getAttribute('label') ?? '';
    const color = this.getAttribute('color') ?? '#0F385A';
    const icono = this.getAttribute('icono') ?? 'default';
    const size = this.getAttribute('size') ?? 'md';
    const icon = ICONOS[icono] || ICONOS.default;

    this.style.setProperty('--card-bg', color);

    this.innerHTML = `
      <article class="card card--${size}" tabindex="0" role="button"
               aria-label="Ir a ${label}">
        <div class="card__icon" style="color:#fff">${icon}</div>
        <span style="color:#fff">${label}</span>
      </article>
    `;
    this.style.background = color;
    this.style.borderRadius = 'var(--radius-lg)';
    this.style.boxShadow = 'var(--shadow-md)';
  }
}

customElements.define('x-linea-card', XLineaCard);
