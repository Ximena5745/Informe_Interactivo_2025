// Adaptador GraphQL. Envía queries al endpoint y mapea la respuesta.

export class GraphqlRepository {
  /**
   * @param {string} endpoint
   * @param {string} [defaultQuery]
   */
  constructor(endpoint, defaultQuery = null) {
    this.endpoint = endpoint;
    this.defaultQuery = defaultQuery;
  }

  /**
   * Ejecuta una query GraphQL arbitraria.
   * @param {string} query
   * @param {object} [variables]
   */
  async query(query, variables = {}) {
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors)}`);
    return json.data;
  }

  async getAll() {
    if (!this.defaultQuery) throw new Error('GraphqlRepository: defaultQuery no definida');
    return this.query(this.defaultQuery);
  }
}
