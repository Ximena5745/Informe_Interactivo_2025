// Value Object SlideId. Garantiza que un id de slide sea válido.

const VALID = /^[a-z0-9][a-z0-9-]{0,40}$/i;

export class SlideId {
  /**
   * @param {string} id
   */
  constructor(id) {
    if (!VALID.test(String(id))) {
      throw new Error(`SlideId inválido: "${id}"`);
    }
    this._id = String(id).toLowerCase();
  }

  get value() {
    return this._id;
  }

  toString() {
    return this._id;
  }

  equals(other) {
    return other instanceof SlideId && other._id === this._id;
  }
}
