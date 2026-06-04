// Helpers DOM seguros. Reemplazan innerHTML con API que escapa automáticamente.

/**
 * Crea un elemento con atributos y children.
 * @param {string} tag
 * @param {object} [attrs]
 * @param {(Node|string|null)[]} [children]
 * @returns {HTMLElement}
 */
export function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class' || k === 'className') {
      el.className = v;
    } else if (k === 'style' && typeof v === 'object') {
      Object.assign(el.style, v);
    } else if (k === 'dataset' && typeof v === 'object') {
      Object.assign(el.dataset, v);
    } else if (k.startsWith('on') && typeof v === 'function') {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === 'html') {
      el.innerHTML = v;
    } else if (k in el && k !== 'list') {
      try {
        el[k] = v;
      } catch {
        el.setAttribute(k, String(v));
      }
    } else {
      el.setAttribute(k, String(v));
    }
  }

  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

/**
 * Reemplaza el contenido de un nodo.
 * @param {HTMLElement} target
 * @param {(Node|string|null)[]} children
 */
export function render(target, children) {
  target.replaceChildren(...children.flat().filter(Boolean));
}

/**
 * Escapa HTML para prevenir XSS.
 * @param {string} s
 */
export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
