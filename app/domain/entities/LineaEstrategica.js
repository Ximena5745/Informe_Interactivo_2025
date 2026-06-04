// Entidad LineaEstrategica. Encapsula invariantes y comportamiento.

import { Porcentaje } from '../value-objects/Porcentaje.js';
import { Color } from '../value-objects/Color.js';
import { calcularCumplimiento } from '../rules/calcularCumplimiento.js';

export class LineaEstrategica {
  /**
   * @param {{
   *   id: string,
   *   nombre: string,
   *   color: string,
   *   icono: string,
   *   slideId: string,
   *   logroSlideId: string,
   *   slidePPT?: string,
   *   real: number,
   *   esperado: number,
   *   cumplimiento?: number,
   *   retos: number,
   *   areas: number,
   *   logros: string[]
   * }} record
   */
  constructor(record) {
    this.id = record.id;
    this.nombre = record.nombre;
    this.color = new Color(record.color);
    this.icono = record.icono || 'default';
    this.slideId = record.slideId;
    this.logroSlideId = record.logroSlideId;
    this.slidePPT = record.slidePPT || '';
    this.real = Number(record.real);
    this.esperado = Number(record.esperado);
    this.cumplimiento = new Porcentaje(
      record.cumplimiento ?? this.real / this.esperado * 100
    );
    this.retos = Number(record.retos);
    this.areas = Number(record.areas);
    this.logros = Array.isArray(record.logros) ? record.logros : [];
  }

  /** Recalcula cumplimiento desde real/esperado. */
  recalcular() {
    this.cumplimiento = calcularCumplimiento(this.real, this.esperado);
    return this;
  }

  toPlain() {
    return {
      id: this.id,
      nombre: this.nombre,
      color: this.color.hex,
      icono: this.icono,
      slideId: this.slideId,
      logroSlideId: this.logroSlideId,
      slidePPT: this.slidePPT,
      real: this.real,
      esperado: this.esperado,
      cumplimiento: this.cumplimiento.value,
      retos: this.retos,
      areas: this.areas,
      logros: this.logros,
    };
  }
}
