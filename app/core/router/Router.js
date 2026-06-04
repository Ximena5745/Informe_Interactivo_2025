// Router SPA con History API + deep-link + soporte hash de fallback.
// Aplica Single Responsibility: solo sabe traducir URL ↔ nombre de slide.

const QUERY_KEY = 'slide';

export class Router {
  /**
   * @param {{
   *   defaultSlide: string,
   *   onNavigate: (slideId: string, opts?: { replace?: boolean }) => void,
   *   onPopState?: (slideId: string) => void
   * }} opts
   */
  constructor({ defaultSlide, onNavigate, onPopState }) {
    this.defaultSlide = defaultSlide;
    this.onNavigate = onNavigate;
    this.onPopState = onPopState;
    this._boundPop = this._handlePopState.bind(this);
    window.addEventListener('popstate', this._boundPop);
  }

  destroy() {
    window.removeEventListener('popstate', this._boundPop);
  }

  /**
   * Navega a un slide. Empuja un estado al historial (deep-link).
   * @param {string} slideId
   * @param {{ replace?: boolean, silent?: boolean }} [options]
   */
  go(slideId, { replace = false, silent = false } = {}) {
    if (!slideId) slideId = this.defaultSlide;
    const url = this._buildUrl(slideId);
    if (replace) history.replaceState({ slideId }, '', url);
    else history.pushState({ slideId }, '', url);
    if (!silent) this.onNavigate?.(slideId, { replace });
  }

  /**
   * Lee la URL actual y devuelve el slide correspondiente.
   * @returns {string}
   */
  current() {
    const params = new URLSearchParams(location.search);
    return params.get(QUERY_KEY) || this._fromHash() || this.defaultSlide;
  }

  /**
   * Inicializa: dispara onNavigate con el slide actual sin tocar el historial.
   */
  start() {
    this.onNavigate?.(this.current(), { replace: true });
  }

  _buildUrl(slideId) {
    const u = new URL(location.href);
    u.searchParams.set(QUERY_KEY, slideId);
    return u.pathname + u.search + u.hash;
  }

  _fromHash() {
    const h = location.hash.replace(/^#\/?/, '');
    return h || null;
  }

  _handlePopState(e) {
    const slideId = e.state?.slideId || this.current();
    this.onPopState?.(slideId);
  }
}
