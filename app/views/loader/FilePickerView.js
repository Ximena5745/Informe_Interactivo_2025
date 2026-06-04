// FilePickerView: pantalla de carga inicial cuando faltan archivos XLSX (modo file://).
// En https/http el DataLoader hace fetch automático y esta vista casi nunca se muestra.
// En file:// el usuario debe subir los .xlsx desde su disco (se cachean en IDB).

import { h, render } from '../../core/render/dom.js';
import { announce } from '../../core/a11y/index.js';

export class FilePickerView {
  /**
   * @param {{ data: { status: Array<{id:string,nombre:string,state:string,obligatorio:boolean}>, env: string }, deps: any }} ctx
   */
  constructor({ data, deps }) {
    this.data = data;
    this.deps = deps;
    this._onChange = this._onChange.bind(this);
  }

  async render(root) {
    const { status, env } = this.data;
    const isFile = env === 'file:';

    const isCached = (id) => status.find((s) => s.id === id)?.state === 'cached';
    const isOblig = (id) => status.find((s) => s.id === id)?.obligatorio;

    const card = (s) => {
      const cached = isCached(s.id);
      const isImg = `
        <div class="picker__icon ${cached ? 'picker__icon--ok' : 'picker__icon--pending'}" aria-hidden="true">
          ${cached ? '✓' : '📄'}
        </div>`;
      const badge = cached
        ? `<span class="picker__badge picker__badge--ok">Cargado</span>`
        : isFile
          ? `<span class="picker__badge picker__badge--pending">Pendiente</span>`
          : `<span class="picker__badge picker__badge--http">HTTP</span>`;

      return h('div', { class: `picker__card ${cached ? 'is-loaded' : ''}` }, [
        h('label', { class: 'picker__label', for: `file-${s.id}` }, [
          isImg,
          h('div', { class: 'picker__meta' }, [
            h('div', { class: 'picker__name' }, [s.nombre]),
            h('div', { class: 'picker__desc' }, [
              s.id + '.xlsx',
              s.obligatorio ? h('span', { class: 'picker__req' }, [' · obligatorio']) : null,
            ]),
          ]),
          badge,
          h('input', {
            type: 'file',
            id: `file-${s.id}`,
            accept: '.xlsx',
            'data-source-id': s.id,
            class: 'picker__input',
            'aria-label': `Subir archivo Excel para ${s.nombre}`,
          }),
        ]),
      ]);
    };

    const view = h('section', { class: 'picker', 'aria-label': 'Cargar archivos Excel' }, [
      h('header', { class: 'picker__header' }, [
        h('h1', {}, ['Informe de Cierre PDI 2025']),
        h('p', { class: 'picker__lead' }, [
          isFile
            ? 'Estás abriendo la app desde tu disco. Sube los libros Excel a continuación. La primera carga puede tardar unos segundos; las siguientes serán instantáneas (caché local).'
            : 'Cargando datos desde el servidor…',
        ]),
      ]),

      h('div', { class: 'picker__grid' }, status.map(card)),

      h('footer', { class: 'picker__footer' }, [
        h('p', { class: 'picker__hint' }, [
          isFile
            ? 'Si ya subiste los archivos antes, aparecerán marcados como "Cargado". Puedes reemplazarlos en cualquier momento.'
            : 'Si alguna fuente aparece como "Pendiente", hubo un error de red. Recarga la página.',
        ]),
        h('details', { class: 'picker__details' }, [
          h('summary', {}, ['¿De dónde vienen estos archivos?']),
          h('p', {}, [
            'Cada fuente es un libro Excel en ',
            h('code', {}, ['/data/<fuente>/<fuente>.xlsx']),
            '. Edita el archivo en Excel o Google Sheets, guárdalo y recarga esta página. ' +
              'Ver ',
            h('code', {}, ['/data/README.md']),
            ' para la guía completa.',
          ]),
        ]),
      ]),
    ]);

    render(root, [view]);

    root.addEventListener('change', this._onChange);
  }

  destroy() {
    this.deps.root.removeEventListener('change', this._onChange);
  }

  async _onChange(e) {
    const input = e.target;
    if (!input.matches('input[type=file][data-source-id]')) return;
    const file = input.files?.[0];
    if (!file) return;
    const id = input.dataset.sourceId;
    announce(`Subiendo ${file.name}…`);

    try {
      this.deps.dataLoader.setFile(id, file);
      await this.deps.dataLoader.refresh(id);
      announce(`${file.name} cargado correctamente.`);
      // Re-render: si todas las obligatorias están listas, continuar al home.
      const allOk = await this._allObligatoriasCargadas();
      if (allOk) {
        await this.deps.slideService.goHome();
        return;
      }
      // Si falta alguna, refrescar esta misma vista
      const status = await this.deps.dataLoader.status();
      this.data.status = status;
      await this.render(this.deps.root);
    } catch (err) {
      console.error('[FilePicker] error al cargar', err);
      announce(`Error: ${err.message}`);
      input.value = '';
    }
  }

  async _allObligatoriasCargadas() {
    const st = await this.deps.dataLoader.status();
    return st.filter((s) => s.obligatorio).every((s) => s.state === 'cached' || s.state === 'http');
  }
}
