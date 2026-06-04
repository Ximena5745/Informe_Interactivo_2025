// Test runner minimalista para navegador.
// Carga specs como módulos, los ejecuta, reporta en DOM.

const suitesEl = document.getElementById('suites');
const summaryEl = document.getElementById('summary');
const totalEl = document.getElementById('total');
const passedEl = document.getElementById('passed');
const failedEl = document.getElementById('failed');

let total = 0;
let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function assertEq(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${msg || 'assertEq'}\n  esperado: ${e}\n  actual:   ${a}`);
  }
}

function assertThrows(fn, ctor, msg) {
  let threw = null;
  try { fn(); } catch (e) { threw = e; }
  if (!threw) throw new Error(msg || 'esperaba excepción, no lanzó');
  if (ctor && !(threw instanceof ctor)) {
    throw new Error(`${msg || 'assertThrows'}: tipo incorrecto: ${threw.name}`);
  }
}

async function describe(name, fn) {
  const suiteEl = document.createElement('details');
  suiteEl.open = true;
  const sumEl = document.createElement('summary');
  sumEl.textContent = `${name} — ejecutando…`;
  suiteEl.append(sumEl);
  const listEl = document.createElement('ul');
  suiteEl.append(listEl);
  suitesEl.append(suiteEl);

  const before = { total, passed, failed };
  try {
    await fn();
    const ok = failed === before.failed;
    suiteEl.classList.add(ok ? 'ok' : 'fail');
    sumEl.textContent = `${name} — ${passed - before.passed} pasaron, ${failed - before.failed} fallaron`;
  } catch (err) {
    suiteEl.classList.add('fail');
    sumEl.textContent = `${name} — ERROR: ${err.message}`;
    console.error(`[${name}]`, err);
  }
}

function it(name, fn) {
  total++;
  const li = document.createElement('li');
  li.className = 'pass';
  li.innerHTML = `<span class="name">${name}</span>`;
  const list = suitesEl.querySelector('details:last-child ul') || document.createElement('ul');
  list.append(li);
  return Promise.resolve()
    .then(() => fn())
    .then(() => {
      passed++;
      passedEl.textContent = passed;
    })
    .catch((err) => {
      failed++;
      failedEl.textContent = failed;
      li.classList.remove('pass');
      li.classList.add('fail');
      li.innerHTML = `<span class="name">✗ ${name}</span><pre>${String(err.stack || err.message)}</pre>`;
      failures.push({ name, err });
    })
    .finally(() => {
      totalEl.textContent = total;
      if (failed > 0) {
        summaryEl.classList.remove('run', 'ok');
        summaryEl.classList.add('fail');
        summaryEl.textContent = `✗ ${failed} de ${total} tests fallaron`;
        document.title = `[FAIL ${failed}/${total}] Tests PDI 2025`;
      } else {
        summaryEl.classList.remove('run', 'fail');
        summaryEl.classList.add('ok');
        summaryEl.textContent = `✓ ${total} tests pasaron`;
        document.title = `[OK ${total}/${total}] Tests PDI 2025`;
      }
    });
}

window.__test = { describe, it, assert, assertEq, assertThrows };

// ────────────────────────────────────────────────────────────────────────────
// Cargar todos los specs
// ────────────────────────────────────────────────────────────────────────────

const SPECS = [
  './unit/porcentaje.spec.js',
  './unit/color.spec.js',
  './unit/eventbus.spec.js',
  './unit/store.spec.js',
  './unit/router.spec.js',
  './unit/linea-estrategica.spec.js',
  './unit/calcularCumplimiento.spec.js',
  './unit/xlsx-repository.spec.js',
];

(async () => {
  for (const path of SPECS) {
    try {
      await import(path);
    } catch (err) {
      console.error(`[runner] no se pudo cargar ${path}:`, err);
    }
  }
})();
