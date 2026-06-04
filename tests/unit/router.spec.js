// Tests: Router (History API mock)

import { Router } from '../../app/core/router/Router.js';
const { describe, it, assert, assertEq } = window.__test;

describe('Router', () => {
  it('defaultSlide cuando no hay query ni hash', () => {
    const r = new Router({ defaultSlide: 'home', onNavigate: () => {} });
    assertEq(r.current(), 'home');
    r.destroy();
  });

  it('lee slide de query string', () => {
    history.replaceState({}, '', '?slide=cal-avance');
    const r = new Router({ defaultSlide: 'home', onNavigate: () => {} });
    assertEq(r.current(), 'cal-avance');
    r.destroy();
    history.replaceState({}, '', '?slide=home');
  });

  it('go pushState actualiza la URL', () => {
    const r = new Router({ defaultSlide: 'home', onNavigate: () => {} });
    r.go('cal-avance', { replace: false });
    assert(location.search.includes('cal-avance'), 'URL debe contener slide=cal-avance');
    r.destroy();
    history.replaceState({}, '', location.pathname);
  });

  it('go replace no añade entrada al historial', () => {
    const r = new Router({ defaultSlide: 'home', onNavigate: () => {} });
    const before = history.length;
    r.go('cal-avance', { replace: true });
    assertEq(history.length, before, 'replace no debe añadir entrada');
    r.destroy();
  });

  it('onNavigate se llama con el slide solicitado', () => {
    let called = null;
    const r = new Router({ defaultSlide: 'home', onNavigate: (id) => { called = id; } });
    r.go('foda');
    assertEq(called, 'foda');
    r.destroy();
  });

  it('start dispara onNavigate con slide actual', () => {
    history.replaceState({}, '', '?slide=edu-avance');
    let called = null;
    const r = new Router({ defaultSlide: 'home', onNavigate: (id) => { called = id; } });
    r.start();
    assertEq(called, 'edu-avance');
    r.destroy();
    history.replaceState({}, '', '?slide=home');
  });
});
