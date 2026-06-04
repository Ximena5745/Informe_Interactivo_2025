// Helpers de accesibilidad.

const ANNOUNCER_ID = 'announcer';

/**
 * Anuncia un mensaje a lectores de pantalla.
 * @param {string} message
 * @param {'polite'|'assertive'} [politeness]
 */
export function announce(message, politeness = 'polite') {
  const el = document.getElementById(ANNOUNCER_ID);
  if (!el) return;
  el.setAttribute('aria-live', politeness);
  el.textContent = '';
  setTimeout(() => {
    el.textContent = message;
  }, 50);
}

/**
 * Detecta la preferencia de movimiento reducido del usuario.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Suscribe a cambios en la preferencia de movimiento reducido.
 * @param {(reduced: boolean) => void} fn
 */
export function onReducedMotionChange(fn) {
  const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (!mq) return () => {};
  const handler = (e) => fn(e.matches);
  mq.addEventListener?.('change', handler);
  return () => mq.removeEventListener?.('change', handler);
}

/**
 * Trap de foco dentro de un contenedor (útil en modales).
 * @param {HTMLElement} container
 * @returns {() => void} función para liberar el trap
 */
export function trapFocus(container) {
  const sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const focusables = () => Array.from(container.querySelectorAll(sel));

  const first = () => focusables()[0];
  const last = () => focusables().at(-1);

  const handler = (e) => {
    if (e.key !== 'Tab') return;
    if (focusables().length === 0) {
      e.preventDefault();
      return;
    }
    if (e.shiftKey && document.activeElement === first()) {
      e.preventDefault();
      last()?.focus();
    } else if (!e.shiftKey && document.activeElement === last()) {
      e.preventDefault();
      first()?.focus();
    }
  };

  container.addEventListener('keydown', handler);
  return () => container.removeEventListener('keydown', handler);
}
