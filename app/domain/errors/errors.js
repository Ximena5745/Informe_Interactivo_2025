// Errores de dominio específicos.

export class DomainError extends Error {
  /**
   * @param {string} message
   * @param {string} [code]
   */
  constructor(message, code = 'DOMAIN_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export class ValidacionError extends DomainError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class NoEncontradoError extends DomainError {
  constructor(message) {
    super(message, 'NOT_FOUND');
  }
}
