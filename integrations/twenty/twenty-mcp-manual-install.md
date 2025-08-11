# Installation manuelle du MCP Server Twenty pour Claude Desktop

## Option 1: Script automatique
```bash
./install-twenty-mcp-server.sh
```

## Option 2: Installation manuelle

### 1. Installer le package (si disponible)
```bash
npm install -g @twentyhq/mcp-server
```

### 2. Configurer Claude Desktop

Créez ou éditez le fichier de configuration Claude Desktop :
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

Ajoutez cette configuration :
```json
{
  "mcpServers": {
    "twenty": {
      "command": "node",
      "args": ["/path/to/twenty-mcp-server.js"],
      "env": {
        "TWENTY_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MjdkYjBjMy1jNjVhLTRiMGQtYmM0Mi03N2NiNTNjNTRmMGIiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiOTI3ZGIwYzMtYzY1YS00YjBkLWJjNDItNzdjYjUzYzU0ZjBiIiwiaWF0IjoxNzUzOTg1MzQ4LCJleHAiOjQ5MDc1ODUzNDcsImp0aSI6IjhmNmI5YTczLWRlNmMtNDlkMC1iYmI2LWVmMzQ1ZWVmMjMyYiJ9.Mx7IQOHMsC9g_7oCODpQJRoQCHTsvcDcH19gzjNCt2g",
        "TWENTY_API_URL": "http://localhost:3000/graphql"
      }
    }
  }
}
```

### 3. Alternative: Utiliser un serveur MCP personnalisé

Si le package npm n'existe pas encore, créez votre propre serveur :

1. Créez un nouveau projet :
```bash
mkdir twenty-mcp-server
cd twenty-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk axios
```

2. Créez le serveur (twenty-mcp-server.js) :
```javascript
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const axios = require('axios');

const TWENTY_API_KEY = process.env.TWENTY_API_KEY;
const TWENTY_API_URL = process.env.TWENTY_API_URL || 'http://localhost:3000/graphql';

class TwentyMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'twenty-crm',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
  }

  setupTools() {
    // Tool pour lister les contacts
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'twenty_list_contacts',
          description: 'List contacts from Twenty CRM',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', default: 10 }
            }
          }
        },
        {
          name: 'twenty_create_contact',
          description: 'Create a new contact in Twenty CRM',
          inputSchema: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' }
            },
            required: ['firstName', 'lastName']
          }
        }
      ]
    }));

    // Implémenter les tools
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'twenty_list_contacts':
          return this.listContacts(args.limit || 10);
        case 'twenty_create_contact':
          return this.createContact(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async listContacts(limit) {
    const query = `
      query ListPeople($limit: Int!) {
        people(first: $limit) {
          edges {
            node {
              id
              name {
                firstName
                lastName
              }
              email
              phone
            }
          }
        }
      }
    `;

    const response = await axios.post(
      TWENTY_API_URL,
      { query, variables: { limit } },
      {
        headers: {
          'Authorization': `Bearer ${TWENTY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  }

  async createContact(data) {
    const mutation = `
      mutation CreatePerson($data: PersonCreateInput!) {
        createPerson(data: $data) {
          id
          name {
            firstName
            lastName
          }
          email
          phone
        }
      }
    `;

    const response = await axios.post(
      TWENTY_API_URL,
      { 
        query: mutation, 
        variables: { 
          data: {
            name: {
              firstName: data.firstName,
              lastName: data.lastName
            },
            email: data.email,
            phone: data.phone
          }
        } 
      },
      {
        headers: {
          'Authorization': `Bearer ${TWENTY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: `Contact created: ${JSON.stringify(response.data, null, 2)}`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new TwentyMCPServer();
server.run().catch(console.error);
```

3. Mettez à jour la configuration Claude :
```json
{
  "mcpServers": {
    "twenty": {
      "command": "node",
      "args": ["/Users/jean-mariedelaunay/twenty-mcp-server/twenty-mcp-server.js"],
      "env": {
        "TWENTY_API_KEY": "votre-api-key",
        "TWENTY_API_URL": "http://localhost:3000/graphql"
      }
    }
  }
}
```

### 4. Redémarrer Claude Desktop

Après la configuration, redémarrez Claude Desktop pour charger le nouveau serveur MCP.