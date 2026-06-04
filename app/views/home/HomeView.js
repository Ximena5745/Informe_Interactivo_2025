// Vista: Home.
// Aplica SRP: solo sabe renderizar el home con datos externos.

import { h, render, escapeHtml } from '../../core/render/dom.js';
import '../../components/sidebar/XSidebar.js';
import '../../components/gauge/XGauge.js';
import '../../components/card/XLineaCard.js';

const BOTONES_IZQ = [
  { label: 'Ciclo de la<br>Estrategia',    target: 'ciclo',   color: '#EC0677', icono: 'rosa',       size: 'xl', textColor: '#fff' },
  { label: 'Avance Líneas<br>Estratégicas', target: 'avances', color: '#A6CE38', icono: 'mapa',       size: 'xl', textColor: '#0F385A' },
  { label: 'Logros por<br>Línea',           target: 'logros',  color: '#1FB2DE', icono: 'estrella',   size: 'xl', textColor: '#0F385A' },
  { label: 'Orgullosamente<br>Poli',        target: 'orgullosamente', color: '#FBAF17', icono: 'graduacion', size: 'xl', textColor: '#0F385A' },
];

const BOTONES_DER = [
  { label: 'Planes Anuales<br>de Retos',   target: 'planes',      color: '#0F385A', icono: 'engranaje', size: 'lg', textColor: '#fff' },
  { label: 'Proyectos<br>Estratégicos',     target: 'proyectos',   color: '#15BECE', icono: 'mapa',      size: 'lg', textColor: '#0F385A' },
  { label: 'Balance<br>Institucional',      target: 'balance',     color: '#42F2F2', icono: 'estrella',  size: 'lg', textColor: '#0F385A' },
];

export class HomeView {
  /**
   * @param {{ data: any, deps: any }} ctx
   */
  constructor({ data, deps }) {
    this.data = data;
    this.deps = deps;
  }

  async render(root) {
    const { branding } = this.data.config;
    const inicio = this.data.navegacion.inicio;

    const buildCol = (items) =>
      items.map((it) =>
        h('x-linea-card', {
          label: it.label,
          color: it.color,
          icono: it.icono,
          size: it.size,
          target: it.target,
        })
      );

    const home = h('section', { class: 'home', 'aria-label': 'Inicio' }, [
      h('header', { class: 'home__header' }, [
        h('div', { class: 'home__titles' }, [
          h('h1', {}, [branding.nombre || 'Informe de Cierre PDI 2025']),
          h('p', {}, [(branding.subtitulo || 'Planeación y Gestión Institucional').toUpperCase()]),
        ]),
        h('img', { class: 'home__logo', src: branding.logo, alt: 'Logo Politécnico Grancolombiano' }),
      ]),

      h('nav', { class: 'home__nav-col', 'aria-label': 'Navegación izquierda' }, buildCol(BOTONES_IZQ)),

      h('div', { class: 'home__center' }, [
        h('img', {
          class: 'home__diagram',
          src: branding.diagramaLineas,
          alt: 'Diagrama de las 6 líneas estratégicas del PDI 2025',
        }),
      ]),

      h('nav', { class: 'home__nav-col', 'aria-label': 'Navegación derecha' }, buildCol(BOTONES_DER)),
    ]);

    render(root, [home]);

    root.addEventListener('navigate', this._onNavigate);
  }

  destroy() {
    this.deps.root.removeEventListener('navigate', this._onNavigate);
  }

  _onNavigate = (e) => {
    const target = e.detail?.target;
    if (target) this.deps.slideService.goTo(target);
  };
}
