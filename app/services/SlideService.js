// SlideService: caso de uso de navegación.
// Orquesta Router + Store + EventBus. Aplica SRP (orquestador, no sabe de DOM).

import { SlideId } from '../domain/value-objects/SlideId.js';

export class SlideService {
  /**
   * @param {{
   *   router: import('../core/router/Router.js').Router,
   *   navRepo: { findById: (id:string)=>Promise<any>; getSlides: ()=>Promise<any[]> },
   *   store: import('../core/store/Store.js').Store,
   *   bus: import('../core/events/EventBus.js').EventBus
   * }} deps
   */
  constructor({ router, navRepo, store, bus }) {
    this.router = router;
    this.navRepo = navRepo;
    this.store = store;
    this.bus = bus;
    this._historial = [];
    this._slideActual = null;
  }

  /**
   * Inicializa: lee la URL, valida, navega.
   */
  async start() {
    const id = this.router.current();
    await this._go(id, { replace: true, pushHistory: false });
  }

  /**
   * Navega a un slide por id.
   * @param {string} id
   */
  async goTo(id) {
    new SlideId(id);
    if (this._slideActual && this._slideActual !== id) {
      this._historial.push(this._slideActual);
      this.store.set('historial', [...this._historial]);
    }
    await this._go(id, { replace: false, pushHistory: true });
  }

  /**
   * Vuelve al slide anterior en el historial.
   */
  async goBack() {
    if (this._historial.length === 0) return;
    const prev = this._historial.pop();
    this.store.set('historial', [...this._historial]);
    await this._go(prev, { replace: true, pushHistory: false });
  }

  /**
   * Vuelve al inicio (vacía historial).
   */
  async goHome() {
    this._historial = [];
    this.store.set('historial', []);
    const inicio = await this.navRepo.getInicio?.() || 'home';
    await this._go(inicio, { replace: false, pushHistory: true });
  }

  /**
   * Devuelve si se puede ir atrás.
   */
  canGoBack() {
    return this._historial.length > 0;
  }

  /**
   * Devuelve si estamos en el inicio.
   */
  isAtHome() {
    const inicio = this.store.get('inicio') || 'home';
    return this._slideActual === inicio;
  }

  async _go(id, { replace, pushHistory }) {
    const slide = await this.navRepo.findById(id);
    if (!slide) {
      console.warn(`[SlideService] slide no encontrado: ${id}`);
      return;
    }
    this._slideActual = id;
    this.store.set('slideActual', id);
    this.store.set('slideActualMeta', slide);
    this.router.go(id, { replace, silent: !pushHistory });
    this.bus.emit('slide:changed', { id, slide, history: [...this._historial] });
  }
}
