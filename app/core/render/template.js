// Tagged template literal para plantillas HTML con interpolación segura.

/**
 * @param {string[]} strings
 * @param {...any} values
 * @returns {string} HTML ya interpolado (los ${} que no son ${safe} se escapan)
 */
export function html(strings, ...values) {
  let out = '';
  strings.forEach((s, i) => {
    out += s;
    if (i < values.length) {
      const v = values[i];
      if (v && typeof v === 'object' && v.__safe === true) {
        out += v.value;
      } else if (v == null || v === false) {
        out += '';
      } else {
        out += String(v)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }
    }
  });
  return out;
}

/** Marca una cadena como segura (no se escapa). */
export function raw(s) {
  return { __safe: true, value: s };
}
