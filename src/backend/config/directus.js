/**
 * Configuration Directus SDK v17
 * Client singleton pour tous les services
 */

import { createDirectus, rest, authentication, readItems, readItem, createItem, updateItem, deleteItem, aggregate } from '@directus/sdk';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

class DirectusClient {
  constructor() {
    this.client = createDirectus(DIRECTUS_URL)
      .with(authentication())
      .with(rest());

    if (DIRECTUS_TOKEN) {
      this.client.setToken(DIRECTUS_TOKEN);
    }
  }

  /**
   * Wrapper pour items().readByQuery() - SDK v17
   */
  items(collection) {
    const client = this.client;
    return {
      async readByQuery(options = {}) {
        const { filter, sort, limit, fields, groupBy, aggregate: agg } = options;
        const params = {};
        if (filter) params.filter = filter;
        if (sort) params.sort = sort;
        if (limit) params.limit = limit;
        if (fields) params.fields = fields;

        if (agg) {
          const result = await client.request(aggregate(collection, { aggregate: agg, groupBy }));
          return { data: result };
        }

        const result = await client.request(readItems(collection, params));
        return { data: result };
      },
      async readOne(id, options = {}) {
        const result = await client.request(readItem(collection, id, options));
        return result;
      },
      async createOne(data) {
        const result = await client.request(createItem(collection, data));
        return result;
      },
      async updateOne(id, data) {
        const result = await client.request(updateItem(collection, id, data));
        return result;
      },
      async deleteOne(id) {
        const result = await client.request(deleteItem(collection, id));
        return result;
      }
    };
  }
}

const directusClient = new DirectusClient();
export default directusClient;
