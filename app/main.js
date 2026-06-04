import { SlideService } from './services/SlideService.js';
import { Router } from './services/Router.js';
import { renderApp } from './components/app.js';
import { setFocusOutline } from './utils/accessibility.js';

const BASE = new URL('./', import.meta.url).href;

async function main() {
  setFocusOutline();

  const root = document.getElementById('main');
  if (!root) return;

  const rawSources = window.__PDI_SOURCES__ || [];
  const bundle    = window.PDI_DATA || {};

  const services = {};
  for (const src of rawSources) {
    const rows = bundle[src.id] || [];
    const schema = src.id === 'sources' ? 'fuentes' : src.id;
    services[src.id] = { rows, schema, source: src };
  }

  const slideService = new SlideService(services);

  document.getElementById('splash')?.remove();
  document.body.setAttribute('data-ready', 'true');

  renderApp(root, slideService, services);

  Router.init(slideService);
}

main();
