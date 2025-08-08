#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const server = new Server(
  {
    name: 'simple-docker-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: List containers
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'list_containers',
        description: 'List all Docker containers',
        inputSchema: {
          type: 'object',
          properties: {
            all: {
              type: 'boolean',
              description: 'Show all containers (default shows just running)',
            },
          },
        },
      },
      {
        name: 'container_logs',
        description: 'Get logs from a container',
        inputSchema: {
          type: 'object',
          properties: {
            container: {
              type: 'string',
              description: 'Container name or ID',
            },
            tail: {
              type: 'number',
              description: 'Number of lines to show from the end of the logs',
              default: 100,
            },
          },
          required: ['container'],
        },
      },
    ],
  };
});

// Tool execution handler
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_containers': {
        const containers = await docker.listContainers({ all: args.all || false });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(containers, null, 2),
            },
          ],
        };
      }

      case 'container_logs': {
        const container = docker.getContainer(args.container);
        const stream = await container.logs({
          stdout: true,
          stderr: true,
          tail: args.tail || 100,
        });
        
        const logs = stream.toString('utf8');
        return {
          content: [
            {
              type: 'text',
              text: logs,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('Simple Docker MCP Server running...');