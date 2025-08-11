#!/usr/bin/env node
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
    // Tool pour lister les outils disponibles
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'twenty_list_companies',
          description: 'List companies from Twenty CRM',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', default: 10, description: 'Number of companies to retrieve' }
            }
          }
        },
        {
          name: 'twenty_list_people',
          description: 'List people/contacts from Twenty CRM',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', default: 10, description: 'Number of people to retrieve' }
            }
          }
        },
        {
          name: 'twenty_create_company',
          description: 'Create a new company in Twenty CRM',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Company name' },
              domainName: { type: 'string', description: 'Company domain/website' },
              employees: { type: 'number', description: 'Number of employees' },
              address: {
                type: 'object',
                properties: {
                  addressStreet1: { type: 'string' },
                  addressCity: { type: 'string' },
                  addressPostcode: { type: 'string' },
                  addressCountry: { type: 'string' }
                }
              }
            },
            required: ['name']
          }
        },
        {
          name: 'twenty_create_person',
          description: 'Create a new person/contact in Twenty CRM',
          inputSchema: {
            type: 'object',
            properties: {
              firstName: { type: 'string', description: 'First name' },
              lastName: { type: 'string', description: 'Last name' },
              email: { type: 'string', description: 'Email address' },
              phone: { type: 'string', description: 'Phone number' },
              companyId: { type: 'string', description: 'ID of the company this person works for' }
            },
            required: ['firstName', 'lastName']
          }
        },
        {
          name: 'twenty_search',
          description: 'Search across all Twenty CRM data',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
              type: { 
                type: 'string', 
                enum: ['companies', 'people', 'all'],
                default: 'all',
                description: 'Type of data to search' 
              }
            },
            required: ['query']
          }
        }
      ]
    }));

    // Implémenter les tools
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'twenty_list_companies':
            return await this.listCompanies(args.limit || 10);
          case 'twenty_list_people':
            return await this.listPeople(args.limit || 10);
          case 'twenty_create_company':
            return await this.createCompany(args);
          case 'twenty_create_person':
            return await this.createPerson(args);
          case 'twenty_search':
            return await this.search(args.query, args.type || 'all');
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async makeGraphQLRequest(query, variables = {}) {
    const response = await axios.post(
      TWENTY_API_URL,
      { query, variables },
      {
        headers: {
          'Authorization': `Bearer ${TWENTY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.errors) {
      throw new Error(JSON.stringify(response.data.errors));
    }

    return response.data;
  }

  async listCompanies(limit) {
    const query = `
      query ListCompanies($limit: Int!) {
        companies(first: $limit) {
          edges {
            node {
              id
              name
              domainName {
                primaryLinkUrl
              }
              employees
              address {
                addressStreet1
                addressCity
                addressCountry
              }
              createdAt
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { limit });
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${data.data.companies.edges.length} companies:\n\n${
            data.data.companies.edges.map(edge => 
              `- ${edge.node.name} (${edge.node.domainName?.primaryLinkUrl || 'No domain'})\n  Employees: ${edge.node.employees || 'Unknown'}\n  Location: ${edge.node.address?.addressCity || 'Unknown'}`
            ).join('\n\n')
          }`
        }
      ]
    };
  }

  async listPeople(limit) {
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
              company {
                name
              }
              createdAt
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { limit });
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${data.data.people.edges.length} people:\n\n${
            data.data.people.edges.map(edge => 
              `- ${edge.node.name.firstName} ${edge.node.name.lastName}\n  Email: ${edge.node.email || 'No email'}\n  Phone: ${edge.node.phone || 'No phone'}\n  Company: ${edge.node.company?.name || 'No company'}`
            ).join('\n\n')
          }`
        }
      ]
    };
  }

  async createCompany(companyData) {
    const mutation = `
      mutation CreateCompany($data: CompanyCreateInput!) {
        createCompany(data: $data) {
          id
          name
          domainName {
            primaryLinkUrl
          }
          employees
          address {
            addressStreet1
            addressCity
            addressCountry
          }
        }
      }
    `;

    const variables = {
      data: {
        name: companyData.name,
        employees: companyData.employees,
        domainName: companyData.domainName ? {
          primaryLinkUrl: companyData.domainName.startsWith('http') ? companyData.domainName : `https://${companyData.domainName}`
        } : undefined,
        address: companyData.address
      }
    };

    const data = await this.makeGraphQLRequest(mutation, variables);
    
    return {
      content: [
        {
          type: 'text',
          text: `Company created successfully!\n\nID: ${data.data.createCompany.id}\nName: ${data.data.createCompany.name}\nDomain: ${data.data.createCompany.domainName?.primaryLinkUrl || 'None'}`
        }
      ]
    };
  }

  async createPerson(personData) {
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
          company {
            name
          }
        }
      }
    `;

    const variables = {
      data: {
        name: {
          firstName: personData.firstName,
          lastName: personData.lastName
        },
        email: personData.email,
        phone: personData.phone,
        companyId: personData.companyId
      }
    };

    const data = await this.makeGraphQLRequest(mutation, variables);
    
    return {
      content: [
        {
          type: 'text',
          text: `Person created successfully!\n\nID: ${data.data.createPerson.id}\nName: ${data.data.createPerson.name.firstName} ${data.data.createPerson.name.lastName}\nEmail: ${data.data.createPerson.email || 'None'}\nCompany: ${data.data.createPerson.company?.name || 'None'}`
        }
      ]
    };
  }

  async search(searchQuery, type) {
    const results = [];

    if (type === 'companies' || type === 'all') {
      const companiesQuery = `
        query SearchCompanies($filter: CompanyFilterInput!) {
          companies(filter: $filter) {
            edges {
              node {
                id
                name
                domainName {
                  primaryLinkUrl
                }
              }
            }
          }
        }
      `;

      try {
        const data = await this.makeGraphQLRequest(companiesQuery, {
          filter: {
            name: {
              ilike: `%${searchQuery}%`
            }
          }
        });

        if (data.data.companies.edges.length > 0) {
          results.push(`Companies matching "${searchQuery}":\n${
            data.data.companies.edges.map(edge => 
              `- ${edge.node.name} (${edge.node.domainName?.primaryLinkUrl || 'No domain'})`
            ).join('\n')
          }`);
        }
      } catch (error) {
        // Ignore errors for search
      }
    }

    if (type === 'people' || type === 'all') {
      const peopleQuery = `
        query SearchPeople($filter: PersonFilterInput!) {
          people(filter: $filter) {
            edges {
              node {
                id
                name {
                  firstName
                  lastName
                }
                email
              }
            }
          }
        }
      `;

      try {
        const data = await this.makeGraphQLRequest(peopleQuery, {
          filter: {
            or: [
              { name: { firstName: { ilike: `%${searchQuery}%` } } },
              { name: { lastName: { ilike: `%${searchQuery}%` } } },
              { email: { ilike: `%${searchQuery}%` } }
            ]
          }
        });

        if (data.data.people.edges.length > 0) {
          results.push(`People matching "${searchQuery}":\n${
            data.data.people.edges.map(edge => 
              `- ${edge.node.name.firstName} ${edge.node.name.lastName} (${edge.node.email || 'No email'})`
            ).join('\n')
          }`);
        }
      } catch (error) {
        // Ignore errors for search
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: results.length > 0 ? results.join('\n\n') : `No results found for "${searchQuery}"`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Twenty MCP Server running...');
  }
}

// Démarrer le serveur
const server = new TwentyMCPServer();
server.run().catch(console.error);