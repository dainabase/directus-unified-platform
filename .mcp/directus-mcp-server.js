#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
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
const server = new Server({
  name: 'directus-mcp',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {}
  }
});

// Handle list tools request
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'directus_list_collections',
      description: 'List all collections in Directus',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'directus_get_items',
      description: 'Get items from a Directus collection',
      inputSchema: {
        type: 'object',
        properties: {
          collection: { type: 'string', description: 'Collection name' },
          filter: { type: 'object', description: 'Filter object' },
          limit: { type: 'number', description: 'Number of items to return' }
        },
        required: ['collection']
      }
    },
    {
      name: 'directus_create_item',
      description: 'Create a new item in a Directus collection',
      inputSchema: {
        type: 'object',
        properties: {
          collection: { type: 'string', description: 'Collection name' },
          data: { type: 'object', description: 'Item data' }
        },
        required: ['collection', 'data']
      }
    },
    {
      name: 'directus_update_item',
      description: 'Update an item in a Directus collection',
      inputSchema: {
        type: 'object',
        properties: {
          collection: { type: 'string', description: 'Collection name' },
          id: { type: 'string', description: 'Item ID' },
          data: { type: 'object', description: 'Update data' }
        },
        required: ['collection', 'id', 'data']
      }
    }
  ]
}));

// Handle tool execution
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    
    switch (name) {
      case 'directus_list_collections':
        const collectionsResponse = await axiosInstance.get('/collections');
        result = collectionsResponse.data.data;
        break;

      case 'directus_get_items':
        const { collection, filter = {}, limit = 100 } = args;
        const itemsResponse = await axiosInstance.get(`/items/${collection}`, {
          params: { filter, limit }
        });
        result = itemsResponse.data.data;
        break;

      case 'directus_create_item':
        const createResponse = await axiosInstance.post(`/items/${args.collection}`, args.data);
        result = createResponse.data.data;
        break;

      case 'directus_update_item':
        const updateResponse = await axiosInstance.patch(`/items/${args.collection}/${args.id}`, args.data);
        result = updateResponse.data.data;
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Directus MCP server started');
}

main().catch(console.error);