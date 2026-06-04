// Composition Root: arma el grafo de dependencias y arranca la app.
// Flujo:
//   1. Crear DataLoader con BASE.
//   2. Inicializar repositorios (no carga datos todavía).
//   3. Verificar estado de cada fuente (IDB → URL → File).
//   4. Si falta alguna obligatoria → mostrar FilePickerView.
//   5. Si todo OK → montar Router, servicios, sidebar y arrancar navegación.

import { Container } from './core/di/Container.js';
import { EventBus } from './core/events/EventBus.js';
import { Store } from './core/store/Store.js';
import { Router } from './core/router/Router.js';
import { DataLoader } from './services/DataLoader.js';
import { SlideService } from './services/SlideService.js';
import { AvanceService } from './services/AvanceService.js';
import { HomeView } from './views/home/HomeView.js';
import { LineaView } from './views/linea/LineaView.js';
import { LogroView } from './views/logro/LogroView.js';
import { FilePickerView } from './views/loader/FilePickerView.js';

import './components/sidebar/XSidebar.js';
import './components/gauge/XGauge.js';
import './components/card/XLineaCard.js';

export async function bootstrap(rootEl, { baseUrl = './' } = {}) {
  const container = new Container();
  const bus = new EventBus();
  const store = new Store();

  container.registerInstance(Symbol('bus'), bus);
  container.registerInstance(Symbol('store'), store);
  container.registerInstance(Symbol('root'), rootEl);

  const loader = new DataLoader({ baseUrl });
  await loader.init();
  container.registerInstance(Symbol('dataLoader'), loader);

  const status = await loader.status();
  const isFile = location.protocol === 'file:';
  const needsUpload = status.some(
    (s) => s.obligatorio && (s.state === 'missing' || (isFile && s.state === 'pending-file'))
  );

  if (needsUpload) {
    const deps = { dataLoader: loader, slideService: null, root: rootEl, bus };
    const picker = new FilePickerView({ data: { status, env: location.protocol }, deps });
    await picker.render(rootEl);
    return { container, bus, store, status: 'loading' };
  }

  const config = await loader.get('config');
  const navegacion = await loader.get('navegacion');
  const avance = await loader.get('avance');

  container.registerInstance(Symbol('config'), config);
  container.registerInstance(Symbol('navegacion'), navegacion);
  container.registerInstance(Symbol('avance'), avance);

  const navRepo = loader.repos.navegacion;
  const avanceRepo = loader.repos.avance;
  container.registerInstance(Symbol('navRepo'), navRepo);
  container.registerInstance(Symbol('avanceRepo'), avanceRepo);

  const router = new Router({
    defaultSlide: navegacion.inicio || 'home',
    onNavigate: (id) => renderSlide(id, { container, bus, root: rootEl }),
    onPopState: (id) => renderSlide(id, { container, bus, root: rootEl }),
  });
  container.registerInstance(Symbol('router'), router);

  const slideService = new SlideService({ router, navRepo, store, bus });
  container.registerInstance(Symbol('slideService'), slideService);

  const avanceService = new AvanceService({ avanceRepo });
  container.registerInstance(Symbol('avanceService'), avanceService);

  const sidebar = document.querySelector('x-sidebar');
  if (sidebar) {
    sidebar.deps = { slideService, bus };
  }

  setupKeyboardShortcuts(config.atajos, slideService);

  await slideService.start();

  return { container, bus, store, slideService, avanceService, status: 'ready' };
}

function setupKeyboardShortcuts(atajos, slideService) {
  const homeKeys = new Set((atajos?.home || ['h', 'H']).map((k) => k.toLowerCase()));
  const backKeys = new Set((atajos?.atras || ['escape']).map((k) => k.toLowerCase()));

  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;
    const key = e.key.toLowerCase();
    if (homeKeys.has(key)) {
      e.preventDefault();
      slideService.goHome();
    } else if (backKeys.has(key)) {
      e.preventDefault();
      slideService.goBack();
    }
  });
}

async function renderSlide(id, { container, bus, root }) {
  const navegacion = container.resolve(Symbol('navegacion'));
  const slide = navegacion.slides.find((s) => s.id === id);
  if (!slide) return;

  root.innerHTML = '';
  root.classList.add('slide-enter');
  setTimeout(() => root.classList.remove('slide-enter'), 300);

  const slideService = container.resolve(Symbol('slideService'));
  const avanceService = container.resolve(Symbol('avanceService'));
  const config = container.resolve(Symbol('config'));

  const deps = { slideService, bus, root, container };

  if (id === navegacion.inicio || id === 'home') {
    const view = new HomeView({
      data: { config, navegacion },
      deps,
    });
    await view.render(root);
    return;
  }

  if (slide.layout === 'linea' && slide.lineaId) {
    const linea = await avanceService.getLinea(slide.lineaId);
    const view = new LineaView({ data: { linea, branding: config.branding }, deps });
    await view.render(root);
    return;
  }

  if (slide.layout === 'logro' && slide.imagen) {
    const view = new LogroView({ data: { slide }, deps });
    await view.render(root);
    return;
  }

  renderPlaceholder(root, slide, config);
}

function renderPlaceholder(root, slide, config) {
  const header = document.createElement('div');
  header.className = 'slide-header';
  header.style.background = slide.colorHeader || '#0F385A';
  header.innerHTML = `<h2 class="slide-header__title">${slide.titulo}</h2>`;

  const body = document.createElement('div');
  body.className = 'slide-body';
  body.innerHTML = `<p>Vista en construcción para <strong>${slide.titulo}</strong>.</p>
    <p style="margin-top:var(--space-3);color:var(--color-text-muted);font-size:var(--fs-sm)">
      Esta vista se alimenta de la fuente <code>${slide.origen || 'config'}</code> en <code>/data/${slide.origen || 'config'}/</code>.
    </p>`;

  const sec = document.createElement('section');
  sec.className = 'slide';
  sec.append(header, body);
  root.replaceChildren(sec);
}
