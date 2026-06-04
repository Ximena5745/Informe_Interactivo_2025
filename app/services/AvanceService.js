// AvanceService: caso de uso del cumplimiento Kawak.
// Combina repositorio + entidades de dominio.

import { LineaEstrategica } from '../domain/entities/LineaEstrategica.js';
import { rankingLineas } from '../domain/rules/rankingLineas.js';
import { NoEncontradoError } from '../domain/errors/errors.js';

export class AvanceService {
  /**
   * @param {{ avanceRepo: any }} deps
   */
  constructor({ avanceRepo }) {
    this.repo = avanceRepo;
  }

  async getAll() {
    const data = await this.repo.getAll();
    return {
      ...data,
      lineas: data.lineas.map((r) => new LineaEstrategica(r)),
    };
  }

  async getLinea(lineaId) {
    const record = await this.repo.findByLinea(lineaId);
    if (!record) throw new NoEncontradoError(`Línea no encontrada: ${lineaId}`);
    return new LineaEstrategica(record);
  }

  async getRanking() {
    const { lineas } = await this.getAll();
    return rankingLineas(lineas);
  }

  async getGlobal() {
    const data = await this.repo.getAll();
    return data.global;
  }
}
