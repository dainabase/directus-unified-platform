#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import axios from 'axios';

// Configuration
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';

const axiosInstance = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Create server instance
const server = new McpServer({
  name: 'directus-mcp',
  version: '1.0.0',
});

// Register tools
server.tool(
  'directus_list_collections',
  'List all collections in Directus',
  {},
  async () => {
    try {
      const response = await axiosInstance.get('/collections');
      return {
        content: [{ type: 'text', text: JSON.stringify(response.data.data, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

server.tool(
  'directus_get_items',
  'Get items from a Directus collection',
  {
    collection: z.string().describe('Collection name'),
    filter: z.record(z.any()).optional().describe('Filter object'),
    limit: z.number().optional().default(100).describe('Number of items to return'),
    fields: z.array(z.string()).optional().describe('Fields to return'),
    sort: z.array(z.string()).optional().describe('Sort fields'),
  },
  async ({ collection, filter, limit, fields, sort }) => {
    try {
      const params = { limit };
      if (filter) params.filter = JSON.stringify(filter);
      if (fields) params.fields = fields.join(',');
      if (sort) params.sort = sort.join(',');
      const response = await axiosInstance.get(`/items/${collection}`, { params });
      return {
        content: [{ type: 'text', text: JSON.stringify(response.data.data, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

server.tool(
  'directus_create_item',
  'Create a new item in a Directus collection',
  {
    collection: z.string().describe('Collection name'),
    data: z.record(z.any()).describe('Item data'),
  },
  async ({ collection, data }) => {
    try {
      const response = await axiosInstance.post(`/items/${collection}`, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(response.data.data, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

server.tool(
  'directus_update_item',
  'Update an item in a Directus collection',
  {
    collection: z.string().describe('Collection name'),
    id: z.string().describe('Item ID'),
    data: z.record(z.any()).describe('Update data'),
  },
  async ({ collection, id, data }) => {
    try {
      const response = await axiosInstance.patch(`/items/${collection}/${id}`, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(response.data.data, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

server.tool(
  'directus_delete_item',
  'Delete an item from a Directus collection',
  {
    collection: z.string().describe('Collection name'),
    id: z.string().describe('Item ID'),
  },
  async ({ collection, id }) => {
    try {
      await axiosInstance.delete(`/items/${collection}/${id}`);
      return {
        content: [{ type: 'text', text: `Item ${id} deleted from ${collection}` }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

server.tool(
  'directus_get_schema',
  'Get the schema/fields of a Directus collection',
  {
    collection: z.string().describe('Collection name'),
  },
  async ({ collection }) => {
    try {
      const response = await axiosInstance.get(`/fields/${collection}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(response.data.data, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Directus MCP server started');
}

main().catch(console.error);
