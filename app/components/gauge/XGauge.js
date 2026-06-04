// Web Component <x-gauge> — anillo SVG con porcentaje.
// Props: value (0-100), label, color.

const SVG_NS = 'http://www.w3.org/2000/svg';
const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export class XGauge extends HTMLElement {
  static observedAttributes = ['value', 'label', 'color'];

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this._render();
  }

  _render() {
    const value = Number(this.getAttribute('value') ?? 0);
    const label = this.getAttribute('label') ?? '';
    const color = this.getAttribute('color') ?? '#1FB2DE';
    const filled = Math.max(0, Math.min(100, value)) / 100 * CIRCUMFERENCE;
    const ariaValue = `${Math.round(value)}%`;

    this.innerHTML = `
      <div class="gauge" role="img" aria-label="${label}: ${ariaValue}">
        <svg class="gauge__svg" viewBox="0 0 100 100" aria-hidden="true">
          <circle class="gauge__track" cx="50" cy="50" r="${RADIUS}" />
          <circle class="gauge__progress"
                  cx="50" cy="50" r="${RADIUS}"
                  stroke="${color}"
                  stroke-dasharray="${filled.toFixed(2)} ${(CIRCUMFERENCE - filled).toFixed(2)}" />
        </svg>
        <div class="gauge__value" aria-hidden="true">${Math.round(value)}%</div>
        <div class="gauge__label" aria-hidden="true">${label}</div>
      </div>
    `;
  }
}

customElements.define('x-gauge', XGauge);
