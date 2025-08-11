#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const axios = require('axios');

const TWENTY_API_KEY = process.env.TWENTY_API_KEY;
const TWENTY_API_URL = process.env.TWENTY_API_URL || 'http://localhost:3000/graphql';

class TwentyMCPServerFull {
  constructor() {
    this.server = new Server(
      {
        name: 'twenty-crm-full',
        version: '2.0.0',
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
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        // ========== COMPANIES ==========
        {
          name: 'twenty_list_companies',
          description: 'List companies with filters and sorting',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', default: 10 },
              filter: { 
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  domainName: { type: 'string' },
                  idealCustomerProfile: { type: 'boolean' }
                }
              },
              orderBy: { 
                type: 'object',
                properties: {
                  field: { type: 'string', enum: ['name', 'createdAt', 'employees'] },
                  direction: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' }
                }
              }
            }
          }
        },
        {
          name: 'twenty_get_company',
          description: 'Get a specific company by ID',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Company ID' }
            },
            required: ['id']
          }
        },
        {
          name: 'twenty_create_company',
          description: 'Create a new company',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              domainName: { type: 'string' },
              employees: { type: 'number' },
              idealCustomerProfile: { type: 'boolean' },
              annualRecurringRevenue: { type: 'number' },
              address: {
                type: 'object',
                properties: {
                  addressStreet1: { type: 'string' },
                  addressStreet2: { type: 'string' },
                  addressCity: { type: 'string' },
                  addressPostcode: { type: 'string' },
                  addressState: { type: 'string' },
                  addressCountry: { type: 'string' }
                }
              }
            },
            required: ['name']
          }
        },
        {
          name: 'twenty_update_company',
          description: 'Update an existing company',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Company ID' },
              data: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  domainName: { type: 'string' },
                  employees: { type: 'number' },
                  idealCustomerProfile: { type: 'boolean' },
                  annualRecurringRevenue: { type: 'number' },
                  address: { type: 'object' }
                }
              }
            },
            required: ['id', 'data']
          }
        },
        {
          name: 'twenty_delete_company',
          description: 'Delete a company',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Company ID' }
            },
            required: ['id']
          }
        },

        // ========== PEOPLE ==========
        {
          name: 'twenty_list_people',
          description: 'List people/contacts with filters',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', default: 10 },
              filter: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' },
                  companyId: { type: 'string' }
                }
              }
            }
          }
        },
        {
          name: 'twenty_get_person',
          description: 'Get a specific person by ID',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string' }
            },
            required: ['id']
          }
        },
        {
          name: 'twenty_create_person',
          description: 'Create a new person/contact',
          inputSchema: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              linkedinLink: { type: 'string' },
              jobTitle: { type: 'string' },
              companyId: { type: 'string' }
            },
            required: ['firstName', 'lastName']
          }
        },
        {
          name: 'twenty_update_person',
          description: 'Update an existing person',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  linkedinLink: { type: 'string' },
                  jobTitle: { type: 'string' },
                  companyId: { type: 'string' }
                }
              }
            },
            required: ['id', 'data']
          }
        },
        {
          name: 'twenty_delete_person',
          description: 'Delete a person',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string' }
            },
            required: ['id']
          }
        },

        // ========== OPPORTUNITIES ==========
        {
          name: 'twenty_list_opportunities',
          description: 'List sales opportunities',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', default: 10 },
              filter: {
                type: 'object',
                properties: {
                  stage: { type: 'string' },
                  companyId: { type: 'string' },
                  personId: { type: 'string' }
                }
              }
            }
          }
        },
        {
          name: 'twenty_create_opportunity',
          description: 'Create a new opportunity',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              stage: { type: 'string', enum: ['NEW', 'SCREENING', 'MEETING', 'PROPOSAL', 'CUSTOMER'] },
              closeDate: { type: 'string', format: 'date' },
              amount: { type: 'number' },
              probability: { type: 'number', minimum: 0, maximum: 100 },
              companyId: { type: 'string' },
              personId: { type: 'string' }
            },
            required: ['name']
          }
        },
        {
          name: 'twenty_update_opportunity',
          description: 'Update an opportunity',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  stage: { type: 'string' },
                  closeDate: { type: 'string' },
                  amount: { type: 'number' },
                  probability: { type: 'number' }
                }
              }
            },
            required: ['id', 'data']
          }
        },

        // ========== TASKS ==========
        {
          name: 'twenty_list_tasks',
          description: 'List tasks',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', default: 10 },
              filter: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
                  assigneeId: { type: 'string' }
                }
              }
            }
          }
        },
        {
          name: 'twenty_create_task',
          description: 'Create a new task',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
              status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' },
              dueAt: { type: 'string', format: 'date-time' },
              assigneeId: { type: 'string' }
            },
            required: ['title']
          }
        },
        {
          name: 'twenty_update_task',
          description: 'Update a task',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  body: { type: 'string' },
                  status: { type: 'string' },
                  dueAt: { type: 'string' }
                }
              }
            },
            required: ['id', 'data']
          }
        },

        // ========== NOTES ==========
        {
          name: 'twenty_list_notes',
          description: 'List notes',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', default: 10 },
              filter: {
                type: 'object',
                properties: {
                  targetId: { type: 'string', description: 'ID of company/person/opportunity' }
                }
              }
            }
          }
        },
        {
          name: 'twenty_create_note',
          description: 'Create a note',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
              targetType: { type: 'string', enum: ['Company', 'Person', 'Opportunity'] },
              targetId: { type: 'string' }
            },
            required: ['body', 'targetType', 'targetId']
          }
        },

        // ========== CALENDAR ==========
        {
          name: 'twenty_list_calendar_events',
          description: 'List calendar events',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', default: 10 },
              filter: {
                type: 'object',
                properties: {
                  startsAt: { type: 'string', format: 'date-time' },
                  endsAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        {
          name: 'twenty_create_calendar_event',
          description: 'Create a calendar event',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              startsAt: { type: 'string', format: 'date-time' },
              endsAt: { type: 'string', format: 'date-time' },
              isFullDay: { type: 'boolean', default: false },
              location: { type: 'string' },
              participantIds: { type: 'array', items: { type: 'string' } }
            },
            required: ['title', 'startsAt', 'endsAt']
          }
        },

        // ========== WORKFLOWS ==========
        {
          name: 'twenty_list_workflows',
          description: 'List workflows',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', default: 10 }
            }
          }
        },
        {
          name: 'twenty_trigger_workflow',
          description: 'Trigger a workflow',
          inputSchema: {
            type: 'object',
            properties: {
              workflowId: { type: 'string' },
              data: { type: 'object', description: 'Data to pass to workflow' }
            },
            required: ['workflowId']
          }
        },

        // ========== ATTACHMENTS ==========
        {
          name: 'twenty_list_attachments',
          description: 'List attachments for an object',
          inputSchema: {
            type: 'object',
            properties: {
              targetType: { type: 'string' },
              targetId: { type: 'string' }
            },
            required: ['targetType', 'targetId']
          }
        },

        // ========== WORKSPACE ==========
        {
          name: 'twenty_get_workspace_info',
          description: 'Get current workspace information',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'twenty_list_workspace_members',
          description: 'List workspace members',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', default: 10 }
            }
          }
        },

        // ========== SEARCH ==========
        {
          name: 'twenty_global_search',
          description: 'Search across all data in Twenty',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              types: { 
                type: 'array', 
                items: { 
                  type: 'string',
                  enum: ['companies', 'people', 'opportunities', 'tasks', 'notes']
                },
                default: ['companies', 'people']
              },
              limit: { type: 'number', default: 10 }
            },
            required: ['query']
          }
        },

        // ========== ANALYTICS ==========
        {
          name: 'twenty_get_analytics',
          description: 'Get analytics and statistics',
          inputSchema: {
            type: 'object',
            properties: {
              type: { 
                type: 'string', 
                enum: ['opportunities_by_stage', 'tasks_by_status', 'recent_activity'],
                default: 'recent_activity'
              }
            }
          }
        },

        // ========== CUSTOM FIELDS ==========
        {
          name: 'twenty_execute_custom_query',
          description: 'Execute a custom GraphQL query (advanced)',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'GraphQL query' },
              variables: { type: 'object', description: 'Query variables' }
            },
            required: ['query']
          }
        }
      ]
    }));

    // Implémenter les handlers pour tous les tools
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Companies
          case 'twenty_list_companies':
            return await this.listCompanies(args);
          case 'twenty_get_company':
            return await this.getCompany(args.id);
          case 'twenty_create_company':
            return await this.createCompany(args);
          case 'twenty_update_company':
            return await this.updateCompany(args.id, args.data);
          case 'twenty_delete_company':
            return await this.deleteCompany(args.id);

          // People
          case 'twenty_list_people':
            return await this.listPeople(args);
          case 'twenty_get_person':
            return await this.getPerson(args.id);
          case 'twenty_create_person':
            return await this.createPerson(args);
          case 'twenty_update_person':
            return await this.updatePerson(args.id, args.data);
          case 'twenty_delete_person':
            return await this.deletePerson(args.id);

          // Opportunities
          case 'twenty_list_opportunities':
            return await this.listOpportunities(args);
          case 'twenty_create_opportunity':
            return await this.createOpportunity(args);
          case 'twenty_update_opportunity':
            return await this.updateOpportunity(args.id, args.data);

          // Tasks
          case 'twenty_list_tasks':
            return await this.listTasks(args);
          case 'twenty_create_task':
            return await this.createTask(args);
          case 'twenty_update_task':
            return await this.updateTask(args.id, args.data);

          // Notes
          case 'twenty_list_notes':
            return await this.listNotes(args);
          case 'twenty_create_note':
            return await this.createNote(args);

          // Calendar
          case 'twenty_list_calendar_events':
            return await this.listCalendarEvents(args);
          case 'twenty_create_calendar_event':
            return await this.createCalendarEvent(args);

          // Workflows
          case 'twenty_list_workflows':
            return await this.listWorkflows(args);
          case 'twenty_trigger_workflow':
            return await this.triggerWorkflow(args.workflowId, args.data);

          // Attachments
          case 'twenty_list_attachments':
            return await this.listAttachments(args.targetType, args.targetId);

          // Workspace
          case 'twenty_get_workspace_info':
            return await this.getWorkspaceInfo();
          case 'twenty_list_workspace_members':
            return await this.listWorkspaceMembers(args);

          // Search & Analytics
          case 'twenty_global_search':
            return await this.globalSearch(args);
          case 'twenty_get_analytics':
            return await this.getAnalytics(args.type);

          // Custom
          case 'twenty_execute_custom_query':
            return await this.executeCustomQuery(args.query, args.variables);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}\n\nDetails: ${JSON.stringify(error.response?.data || error, null, 2)}`
            }
          ]
        };
      }
    });
  }

  async makeGraphQLRequest(query, variables = {}) {
    try {
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
    } catch (error) {
      console.error('GraphQL Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // ========== COMPANIES METHODS ==========
  async listCompanies({ limit = 10, filter = {}, orderBy = { field: 'createdAt', direction: 'DESC' } }) {
    const query = `
      query ListCompanies($first: Int!, $filter: CompanyFilterInput, $orderBy: [CompanyOrderByInput!]) {
        companies(first: $first, filter: $filter, orderBy: $orderBy) {
          edges {
            node {
              id
              name
              domainName {
                primaryLinkUrl
              }
              employees
              annualRecurringRevenue {
                amountMicros
                currencyCode
              }
              idealCustomerProfile
              address {
                addressCity
                addressCountry
              }
              createdAt
              updatedAt
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { 
      first: limit, 
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      orderBy: [{
        [orderBy.field]: orderBy.direction
      }]
    });
    
    const companies = data.data.companies.edges;
    return {
      content: [
        {
          type: 'text',
          text: `Found ${companies.length} companies:\n\n${
            companies.map(edge => {
              const c = edge.node;
              return `📢 ${c.name}\n` +
                     `   🌐 ${c.domainName?.primaryLinkUrl || 'No website'}\n` +
                     `   👥 ${c.employees || 'Unknown'} employees\n` +
                     `   📍 ${c.address?.addressCity || 'Unknown'}, ${c.address?.addressCountry || ''}\n` +
                     `   🎯 ICP: ${c.idealCustomerProfile ? 'Yes' : 'No'}\n` +
                     `   🆔 ${c.id}`;
            }).join('\n\n')
          }`
        }
      ]
    };
  }

  async getCompany(id) {
    const query = `
      query GetCompany($id: ID!) {
        company(id: $id) {
          id
          name
          domainName {
            primaryLinkUrl
          }
          employees
          annualRecurringRevenue {
            amountMicros
            currencyCode
          }
          idealCustomerProfile
          address {
            addressStreet1
            addressStreet2
            addressCity
            addressPostcode
            addressState
            addressCountry
          }
          linkedinLink {
            primaryLinkUrl
          }
          xLink {
            primaryLinkUrl
          }
          people {
            edges {
              node {
                id
                name {
                  firstName
                  lastName
                }
                jobTitle
              }
            }
          }
          opportunities {
            edges {
              node {
                id
                name
                stage
                amount {
                  amountMicros
                }
              }
            }
          }
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { id });
    const company = data.data.company;
    
    return {
      content: [
        {
          type: 'text',
          text: `📢 Company Details: ${company.name}\n\n` +
                `🆔 ID: ${company.id}\n` +
                `🌐 Website: ${company.domainName?.primaryLinkUrl || 'None'}\n` +
                `👥 Employees: ${company.employees || 'Unknown'}\n` +
                `💰 ARR: ${company.annualRecurringRevenue?.amountMicros ? 
                  `${(company.annualRecurringRevenue.amountMicros / 1000000).toFixed(2)} ${company.annualRecurringRevenue.currencyCode}` : 
                  'Not specified'}\n` +
                `🎯 ICP: ${company.idealCustomerProfile ? 'Yes' : 'No'}\n\n` +
                `📍 Address:\n${company.address ? 
                  `   ${company.address.addressStreet1 || ''}\n` +
                  `   ${company.address.addressStreet2 || ''}\n` +
                  `   ${company.address.addressCity || ''} ${company.address.addressPostcode || ''}\n` +
                  `   ${company.address.addressState || ''} ${company.address.addressCountry || ''}` :
                  '   No address'}\n\n` +
                `🔗 Social:\n` +
                `   LinkedIn: ${company.linkedinLink?.primaryLinkUrl || 'None'}\n` +
                `   X/Twitter: ${company.xLink?.primaryLinkUrl || 'None'}\n\n` +
                `👥 People (${company.people.edges.length}):\n${
                  company.people.edges.map(e => 
                    `   - ${e.node.name.firstName} ${e.node.name.lastName}${e.node.jobTitle ? ` (${e.node.jobTitle})` : ''}`
                  ).join('\n') || '   No contacts'
                }\n\n` +
                `💼 Opportunities (${company.opportunities.edges.length}):\n${
                  company.opportunities.edges.map(e => 
                    `   - ${e.node.name} (${e.node.stage})${e.node.amount?.amountMicros ? 
                      ` - $${(e.node.amount.amountMicros / 1000000).toFixed(2)}` : ''}`
                  ).join('\n') || '   No opportunities'
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
        }
      }
    `;

    const data = {
      name: companyData.name,
      employees: companyData.employees,
      idealCustomerProfile: companyData.idealCustomerProfile || false,
      domainName: companyData.domainName ? {
        primaryLinkUrl: companyData.domainName.startsWith('http') ? 
          companyData.domainName : 
          `https://${companyData.domainName}`
      } : undefined,
      address: companyData.address,
      annualRecurringRevenue: companyData.annualRecurringRevenue ? {
        amountMicros: Math.round(companyData.annualRecurringRevenue * 1000000),
        currencyCode: 'USD'
      } : undefined
    };

    const result = await this.makeGraphQLRequest(mutation, { data });
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Company created successfully!\n\n` +
                `🆔 ID: ${result.data.createCompany.id}\n` +
                `📢 Name: ${result.data.createCompany.name}\n` +
                `🌐 Website: ${result.data.createCompany.domainName?.primaryLinkUrl || 'None'}`
        }
      ]
    };
  }

  async updateCompany(id, updateData) {
    const mutation = `
      mutation UpdateCompany($id: ID!, $data: CompanyUpdateInput!) {
        updateCompany(id: $id, data: $data) {
          id
          name
          domainName {
            primaryLinkUrl
          }
          employees
          idealCustomerProfile
        }
      }
    `;

    const data = {
      ...updateData,
      domainName: updateData.domainName ? {
        primaryLinkUrl: updateData.domainName.startsWith('http') ? 
          updateData.domainName : 
          `https://${updateData.domainName}`
      } : undefined,
      annualRecurringRevenue: updateData.annualRecurringRevenue ? {
        amountMicros: Math.round(updateData.annualRecurringRevenue * 1000000),
        currencyCode: 'USD'
      } : undefined
    };

    const result = await this.makeGraphQLRequest(mutation, { id, data });
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Company updated successfully!\n\n` +
                `🆔 ID: ${result.data.updateCompany.id}\n` +
                `📢 Name: ${result.data.updateCompany.name}\n` +
                `👥 Employees: ${result.data.updateCompany.employees || 'Unknown'}\n` +
                `🎯 ICP: ${result.data.updateCompany.idealCustomerProfile ? 'Yes' : 'No'}`
        }
      ]
    };
  }

  async deleteCompany(id) {
    const mutation = `
      mutation DeleteCompany($id: ID!) {
        deleteCompany(id: $id) {
          id
        }
      }
    `;

    await this.makeGraphQLRequest(mutation, { id });
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Company deleted successfully! (ID: ${id})`
        }
      ]
    };
  }

  // ========== PEOPLE METHODS ==========
  async listPeople({ limit = 10, filter = {} }) {
    const query = `
      query ListPeople($first: Int!, $filter: PersonFilterInput) {
        people(first: $first, filter: $filter) {
          edges {
            node {
              id
              name {
                firstName
                lastName
              }
              email
              phone
              jobTitle
              linkedinLink {
                primaryLinkUrl
              }
              company {
                id
                name
              }
              createdAt
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { 
      first: limit, 
      filter: Object.keys(filter).length > 0 ? filter : undefined 
    });
    
    const people = data.data.people.edges;
    return {
      content: [
        {
          type: 'text',
          text: `Found ${people.length} people:\n\n${
            people.map(edge => {
              const p = edge.node;
              return `👤 ${p.name.firstName} ${p.name.lastName}\n` +
                     `   📧 ${p.email || 'No email'}\n` +
                     `   📱 ${p.phone || 'No phone'}\n` +
                     `   💼 ${p.jobTitle || 'No title'} at ${p.company?.name || 'No company'}\n` +
                     `   🔗 ${p.linkedinLink?.primaryLinkUrl || 'No LinkedIn'}\n` +
                     `   🆔 ${p.id}`;
            }).join('\n\n')
          }`
        }
      ]
    };
  }

  async getPerson(id) {
    const query = `
      query GetPerson($id: ID!) {
        person(id: $id) {
          id
          name {
            firstName
            lastName
          }
          email
          phone
          jobTitle
          linkedinLink {
            primaryLinkUrl
          }
          xLink {
            primaryLinkUrl
          }
          company {
            id
            name
            domainName {
              primaryLinkUrl
            }
          }
          opportunities {
            edges {
              node {
                id
                name
                stage
              }
            }
          }
          activityTargets {
            edges {
              node {
                activity {
                  id
                  title
                  type
                  completedAt
                }
              }
            }
          }
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { id });
    const person = data.data.person;
    
    return {
      content: [
        {
          type: 'text',
          text: `👤 Person Details: ${person.name.firstName} ${person.name.lastName}\n\n` +
                `🆔 ID: ${person.id}\n` +
                `📧 Email: ${person.email || 'None'}\n` +
                `📱 Phone: ${person.phone || 'None'}\n` +
                `💼 Job: ${person.jobTitle || 'Unknown'} at ${person.company?.name || 'No company'}\n` +
                `🔗 LinkedIn: ${person.linkedinLink?.primaryLinkUrl || 'None'}\n` +
                `🔗 X/Twitter: ${person.xLink?.primaryLinkUrl || 'None'}\n\n` +
                `🏢 Company: ${person.company ? 
                  `${person.company.name} (${person.company.domainName?.primaryLinkUrl || 'No website'})` : 
                  'Not associated with any company'}\n\n` +
                `💼 Opportunities (${person.opportunities.edges.length}):\n${
                  person.opportunities.edges.map(e => 
                    `   - ${e.node.name} (${e.node.stage})`
                  ).join('\n') || '   No opportunities'
                }\n\n` +
                `📊 Recent Activities (${person.activityTargets.edges.length}):\n${
                  person.activityTargets.edges.slice(0, 5).map(e => 
                    `   - ${e.node.activity.title || 'Untitled'} (${e.node.activity.type})${
                      e.node.activity.completedAt ? ' ✓' : ''
                    }`
                  ).join('\n') || '   No activities'
                }`
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
          company {
            name
          }
        }
      }
    `;

    const data = {
      name: {
        firstName: personData.firstName,
        lastName: personData.lastName
      },
      email: personData.email,
      phone: personData.phone,
      jobTitle: personData.jobTitle,
      companyId: personData.companyId,
      linkedinLink: personData.linkedinLink ? {
        primaryLinkUrl: personData.linkedinLink.startsWith('http') ? 
          personData.linkedinLink : 
          `https://linkedin.com/in/${personData.linkedinLink}`
      } : undefined
    };

    const result = await this.makeGraphQLRequest(mutation, { data });
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Person created successfully!\n\n` +
                `🆔 ID: ${result.data.createPerson.id}\n` +
                `👤 Name: ${result.data.createPerson.name.firstName} ${result.data.createPerson.name.lastName}\n` +
                `📧 Email: ${result.data.createPerson.email || 'None'}\n` +
                `🏢 Company: ${result.data.createPerson.company?.name || 'None'}`
        }
      ]
    };
  }

  async updatePerson(id, updateData) {
    const mutation = `
      mutation UpdatePerson($id: ID!, $data: PersonUpdateInput!) {
        updatePerson(id: $id, data: $data) {
          id
          name {
            firstName
            lastName
          }
          email
          phone
          jobTitle
        }
      }
    `;

    const data = {
      ...updateData,
      name: updateData.firstName || updateData.lastName ? {
        firstName: updateData.firstName,
        lastName: updateData.lastName
      } : undefined,
      linkedinLink: updateData.linkedinLink ? {
        primaryLinkUrl: updateData.linkedinLink.startsWith('http') ? 
          updateData.linkedinLink : 
          `https://linkedin.com/in/${updateData.linkedinLink}`
      } : undefined
    };

    // Remove firstName and lastName from root level
    delete data.firstName;
    delete data.lastName;

    const result = await this.makeGraphQLRequest(mutation, { id, data });
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Person updated successfully!\n\n` +
                `🆔 ID: ${result.data.updatePerson.id}\n` +
                `👤 Name: ${result.data.updatePerson.name.firstName} ${result.data.updatePerson.name.lastName}\n` +
                `📧 Email: ${result.data.updatePerson.email || 'None'}\n` +
                `💼 Job Title: ${result.data.updatePerson.jobTitle || 'None'}`
        }
      ]
    };
  }

  async deletePerson(id) {
    const mutation = `
      mutation DeletePerson($id: ID!) {
        deletePerson(id: $id) {
          id
        }
      }
    `;

    await this.makeGraphQLRequest(mutation, { id });
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Person deleted successfully! (ID: ${id})`
        }
      ]
    };
  }

  // ========== OPPORTUNITIES METHODS ==========
  async listOpportunities({ limit = 10, filter = {} }) {
    const query = `
      query ListOpportunities($first: Int!, $filter: OpportunityFilterInput) {
        opportunities(first: $first, filter: $filter) {
          edges {
            node {
              id
              name
              stage
              closeDate
              amount {
                amountMicros
                currencyCode
              }
              probability
              company {
                name
              }
              person {
                name {
                  firstName
                  lastName
                }
              }
              createdAt
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { 
      first: limit,
      filter: Object.keys(filter).length > 0 ? filter : undefined
    });
    
    const opportunities = data.data.opportunities.edges;
    return {
      content: [
        {
          type: 'text',
          text: `Found ${opportunities.length} opportunities:\n\n${
            opportunities.map(edge => {
              const o = edge.node;
              const amount = o.amount?.amountMicros ? 
                `$${(o.amount.amountMicros / 1000000).toFixed(2)} ${o.amount.currencyCode}` : 
                'No amount';
              return `💼 ${o.name}\n` +
                     `   📊 Stage: ${o.stage}\n` +
                     `   💰 Amount: ${amount}\n` +
                     `   📈 Probability: ${o.probability || 0}%\n` +
                     `   📅 Close Date: ${o.closeDate || 'Not set'}\n` +
                     `   🏢 Company: ${o.company?.name || 'None'}\n` +
                     `   👤 Contact: ${o.person ? `${o.person.name.firstName} ${o.person.name.lastName}` : 'None'}\n` +
                     `   🆔 ${o.id}`;
            }).join('\n\n')
          }`
        }
      ]
    };
  }

  async createOpportunity(oppData) {
    const mutation = `
      mutation CreateOpportunity($data: OpportunityCreateInput!) {
        createOpportunity(data: $data) {
          id
          name
          stage
          amount {
            amountMicros
            currencyCode
          }
        }
      }
    `;

    const data = {
      name: oppData.name,
      stage: oppData.stage || 'NEW',
      closeDate: oppData.closeDate,
      probability: oppData.probability,
      companyId: oppData.companyId,
      personId: oppData.personId,
      amount: oppData.amount ? {
        amountMicros: Math.round(oppData.amount * 1000000),
        currencyCode: 'USD'
      } : undefined
    };

    const result = await this.makeGraphQLRequest(mutation, { data });
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Opportunity created successfully!\n\n` +
                `🆔 ID: ${result.data.createOpportunity.id}\n` +
                `💼 Name: ${result.data.createOpportunity.name}\n` +
                `📊 Stage: ${result.data.createOpportunity.stage}\n` +
                `💰 Amount: ${result.data.createOpportunity.amount ? 
                  `$${(result.data.createOpportunity.amount.amountMicros / 1000000).toFixed(2)}` : 
                  'Not set'}`
        }
      ]
    };
  }

  async updateOpportunity(id, updateData) {
    const mutation = `
      mutation UpdateOpportunity($id: ID!, $data: OpportunityUpdateInput!) {
        updateOpportunity(id: $id, data: $data) {
          id
          name
          stage
          amount {
            amountMicros
            currencyCode
          }
          probability
        }
      }
    `;

    const data = {
      ...updateData,
      amount: updateData.amount ? {
        amountMicros: Math.round(updateData.amount * 1000000),
        currencyCode: 'USD'
      } : undefined
    };

    const result = await this.makeGraphQLRequest(mutation, { id, data });
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Opportunity updated successfully!\n\n` +
                `🆔 ID: ${result.data.updateOpportunity.id}\n` +
                `💼 Name: ${result.data.updateOpportunity.name}\n` +
                `📊 Stage: ${result.data.updateOpportunity.stage}\n` +
                `📈 Probability: ${result.data.updateOpportunity.probability || 0}%`
        }
      ]
    };
  }

  // ========== TASKS METHODS ==========
  async listTasks({ limit = 10, filter = {} }) {
    const query = `
      query ListTasks($first: Int!, $filter: TaskFilterInput) {
        tasks(first: $first, filter: $filter) {
          edges {
            node {
              id
              title
              body
              status
              dueAt
              assignee {
                name {
                  firstName
                  lastName
                }
              }
              createdAt
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { 
      first: limit,
      filter: Object.keys(filter).length > 0 ? filter : undefined
    });
    
    const tasks = data.data.tasks.edges;
    return {
      content: [
        {
          type: 'text',
          text: `Found ${tasks.length} tasks:\n\n${
            tasks.map(edge => {
              const t = edge.node;
              const statusEmoji = {
                'TODO': '📝',
                'IN_PROGRESS': '🔄',
                'DONE': '✅'
              }[t.status] || '❓';
              return `${statusEmoji} ${t.title}\n` +
                     `   Status: ${t.status}\n` +
                     `   ${t.body ? `Description: ${t.body.substring(0, 50)}...\n` : ''}` +
                     `   Due: ${t.dueAt ? new Date(t.dueAt).toLocaleDateString() : 'No due date'}\n` +
                     `   Assignee: ${t.assignee ? `${t.assignee.name.firstName} ${t.assignee.name.lastName}` : 'Unassigned'}\n` +
                     `   🆔 ${t.id}`;
            }).join('\n\n')
          }`
        }
      ]
    };
  }

  async createTask(taskData) {
    const mutation = `
      mutation CreateTask($data: TaskCreateInput!) {
        createTask(data: $data) {
          id
          title
          status
          dueAt
        }
      }
    `;

    const data = {
      title: taskData.title,
      body: taskData.body,
      status: taskData.status || 'TODO',
      dueAt: taskData.dueAt,
      assigneeId: taskData.assigneeId
    };

    const result = await this.makeGraphQLRequest(mutation, { data });
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Task created successfully!\n\n` +
                `🆔 ID: ${result.data.createTask.id}\n` +
                `📝 Title: ${result.data.createTask.title}\n` +
                `📊 Status: ${result.data.createTask.status}\n` +
                `📅 Due: ${result.data.createTask.dueAt ? 
                  new Date(result.data.createTask.dueAt).toLocaleDateString() : 
                  'No due date'}`
        }
      ]
    };
  }

  async updateTask(id, updateData) {
    const mutation = `
      mutation UpdateTask($id: ID!, $data: TaskUpdateInput!) {
        updateTask(id: $id, data: $data) {
          id
          title
          status
          dueAt
        }
      }
    `;

    const result = await this.makeGraphQLRequest(mutation, { id, data: updateData });
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Task updated successfully!\n\n` +
                `🆔 ID: ${result.data.updateTask.id}\n` +
                `📝 Title: ${result.data.updateTask.title}\n` +
                `📊 Status: ${result.data.updateTask.status}\n` +
                `📅 Due: ${result.data.updateTask.dueAt ? 
                  new Date(result.data.updateTask.dueAt).toLocaleDateString() : 
                  'No due date'}`
        }
      ]
    };
  }

  // ========== NOTES METHODS ==========
  async listNotes({ limit = 10, filter = {} }) {
    const query = `
      query ListNotes($first: Int!, $filter: NoteFilterInput) {
        notes(first: $first, filter: $filter) {
          edges {
            node {
              id
              title
              body
              createdAt
              noteTargets {
                edges {
                  node {
                    company {
                      name
                    }
                    person {
                      name {
                        firstName
                        lastName
                      }
                    }
                    opportunity {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { 
      first: limit,
      filter: Object.keys(filter).length > 0 ? filter : undefined
    });
    
    const notes = data.data.notes.edges;
    return {
      content: [
        {
          type: 'text',
          text: `Found ${notes.length} notes:\n\n${
            notes.map(edge => {
              const n = edge.node;
              const targets = n.noteTargets.edges.map(t => {
                if (t.node.company) return `🏢 ${t.node.company.name}`;
                if (t.node.person) return `👤 ${t.node.person.name.firstName} ${t.node.person.name.lastName}`;
                if (t.node.opportunity) return `💼 ${t.node.opportunity.name}`;
                return '❓ Unknown';
              });
              return `📝 ${n.title || 'Untitled Note'}\n` +
                     `   ${n.body ? n.body.substring(0, 100) + '...' : 'No content'}\n` +
                     `   Related to: ${targets.join(', ') || 'Nothing'}\n` +
                     `   Created: ${new Date(n.createdAt).toLocaleDateString()}\n` +
                     `   🆔 ${n.id}`;
            }).join('\n\n')
          }`
        }
      ]
    };
  }

  async createNote(noteData) {
    const mutation = `
      mutation CreateNote($data: NoteCreateInput!) {
        createNote(data: $data) {
          id
          title
          body
        }
      }
    `;

    // Build the note targets based on targetType and targetId
    const noteTargets = [];
    if (noteData.targetType && noteData.targetId) {
      const targetKey = `${noteData.targetType.toLowerCase()}Id`;
      noteTargets.push({
        [targetKey]: noteData.targetId
      });
    }

    const data = {
      title: noteData.title,
      body: noteData.body,
      noteTargets: {
        edges: noteTargets.map(target => ({ node: target }))
      }
    };

    const result = await this.makeGraphQLRequest(mutation, { data });
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Note created successfully!\n\n` +
                `🆔 ID: ${result.data.createNote.id}\n` +
                `📝 Title: ${result.data.createNote.title || 'Untitled'}\n` +
                `📄 Content: ${result.data.createNote.body.substring(0, 100)}...`
        }
      ]
    };
  }

  // ========== CALENDAR METHODS ==========
  async listCalendarEvents({ limit = 10, filter = {} }) {
    const query = `
      query ListCalendarEvents($first: Int!, $filter: CalendarEventFilterInput) {
        calendarEvents(first: $first, filter: $filter) {
          edges {
            node {
              id
              title
              description
              startsAt
              endsAt
              isFullDay
              location
              calendarEventParticipants {
                edges {
                  node {
                    person {
                      name {
                        firstName
                        lastName
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { 
      first: limit,
      filter: Object.keys(filter).length > 0 ? filter : undefined
    });
    
    const events = data.data.calendarEvents.edges;
    return {
      content: [
        {
          type: 'text',
          text: `Found ${events.length} calendar events:\n\n${
            events.map(edge => {
              const e = edge.node;
              const participants = e.calendarEventParticipants.edges.map(p => 
                `${p.node.person.name.firstName} ${p.node.person.name.lastName}`
              );
              return `📅 ${e.title}\n` +
                     `   ${e.description ? `Description: ${e.description}\n` : ''}` +
                     `   Start: ${new Date(e.startsAt).toLocaleString()}\n` +
                     `   End: ${new Date(e.endsAt).toLocaleString()}\n` +
                     `   ${e.isFullDay ? '🌅 All day event\n' : ''}` +
                     `   ${e.location ? `📍 Location: ${e.location}\n` : ''}` +
                     `   👥 Participants: ${participants.join(', ') || 'None'}\n` +
                     `   🆔 ${e.id}`;
            }).join('\n\n')
          }`
        }
      ]
    };
  }

  async createCalendarEvent(eventData) {
    const mutation = `
      mutation CreateCalendarEvent($data: CalendarEventCreateInput!) {
        createCalendarEvent(data: $data) {
          id
          title
          startsAt
          endsAt
        }
      }
    `;

    const data = {
      title: eventData.title,
      description: eventData.description,
      startsAt: eventData.startsAt,
      endsAt: eventData.endsAt,
      isFullDay: eventData.isFullDay || false,
      location: eventData.location,
      calendarEventParticipants: eventData.participantIds ? {
        edges: eventData.participantIds.map(personId => ({
          node: { personId }
        }))
      } : undefined
    };

    const result = await this.makeGraphQLRequest(mutation, { data });
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Calendar event created successfully!\n\n` +
                `🆔 ID: ${result.data.createCalendarEvent.id}\n` +
                `📅 Title: ${result.data.createCalendarEvent.title}\n` +
                `⏰ Start: ${new Date(result.data.createCalendarEvent.startsAt).toLocaleString()}\n` +
                `⏰ End: ${new Date(result.data.createCalendarEvent.endsAt).toLocaleString()}`
        }
      ]
    };
  }

  // ========== WORKFLOWS METHODS ==========
  async listWorkflows({ limit = 10 }) {
    const query = `
      query ListWorkflows($first: Int!) {
        workflows(first: $first) {
          edges {
            node {
              id
              name
              description
              status
              createdAt
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { first: limit });
    
    const workflows = data.data.workflows.edges;
    return {
      content: [
        {
          type: 'text',
          text: `Found ${workflows.length} workflows:\n\n${
            workflows.map(edge => {
              const w = edge.node;
              return `🔄 ${w.name}\n` +
                     `   ${w.description || 'No description'}\n` +
                     `   Status: ${w.status}\n` +
                     `   Created: ${new Date(w.createdAt).toLocaleDateString()}\n` +
                     `   🆔 ${w.id}`;
            }).join('\n\n')
          }`
        }
      ]
    };
  }

  async triggerWorkflow(workflowId, data = {}) {
    const mutation = `
      mutation TriggerWorkflow($workflowId: ID!, $data: JSON) {
        triggerWorkflow(workflowId: $workflowId, data: $data) {
          id
          status
        }
      }
    `;

    const result = await this.makeGraphQLRequest(mutation, { workflowId, data });
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Workflow triggered successfully!\n\n` +
                `🆔 Run ID: ${result.data.triggerWorkflow.id}\n` +
                `📊 Status: ${result.data.triggerWorkflow.status}`
        }
      ]
    };
  }

  // ========== ATTACHMENTS METHODS ==========
  async listAttachments(targetType, targetId) {
    const query = `
      query ListAttachments($filter: AttachmentFilterInput!) {
        attachments(filter: $filter) {
          edges {
            node {
              id
              name
              fullPath
              type
              size
              createdAt
            }
          }
        }
      }
    `;

    const filter = {
      [`${targetType.toLowerCase()}Id`]: { eq: targetId }
    };

    const data = await this.makeGraphQLRequest(query, { filter });
    
    const attachments = data.data.attachments.edges;
    return {
      content: [
        {
          type: 'text',
          text: `Found ${attachments.length} attachments:\n\n${
            attachments.map(edge => {
              const a = edge.node;
              return `📎 ${a.name}\n` +
                     `   Type: ${a.type}\n` +
                     `   Size: ${(a.size / 1024).toFixed(2)} KB\n` +
                     `   Created: ${new Date(a.createdAt).toLocaleDateString()}\n` +
                     `   🆔 ${a.id}`;
            }).join('\n\n')
          }`
        }
      ]
    };
  }

  // ========== WORKSPACE METHODS ==========
  async getWorkspaceInfo() {
    const query = `
      query GetWorkspace {
        currentWorkspace {
          id
          displayName
          logo
          subdomain
          activationStatus
          currentBillingSubscription {
            id
            status
            interval
          }
          workspaceMembers {
            edges {
              node {
                id
                name {
                  firstName
                  lastName
                }
                colorScheme
              }
            }
          }
          featureFlags {
            edges {
              node {
                id
                key
                value
              }
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query);
    const workspace = data.data.currentWorkspace;
    
    return {
      content: [
        {
          type: 'text',
          text: `🏢 Workspace: ${workspace.displayName}\n\n` +
                `🆔 ID: ${workspace.id}\n` +
                `🌐 Subdomain: ${workspace.subdomain}\n` +
                `📊 Status: ${workspace.activationStatus}\n` +
                `💳 Billing: ${workspace.currentBillingSubscription ? 
                  `${workspace.currentBillingSubscription.status} (${workspace.currentBillingSubscription.interval})` : 
                  'No subscription'}\n\n` +
                `👥 Members (${workspace.workspaceMembers.edges.length}):\n${
                  workspace.workspaceMembers.edges.map(m => 
                    `   - ${m.node.name.firstName} ${m.node.name.lastName} (${m.node.colorScheme})`
                  ).join('\n')
                }\n\n` +
                `🚀 Feature Flags:\n${
                  workspace.featureFlags.edges.map(f => 
                    `   - ${f.node.key}: ${f.node.value}`
                  ).join('\n') || '   No feature flags'
                }`
        }
      ]
    };
  }

  async listWorkspaceMembers({ limit = 10 }) {
    const query = `
      query ListWorkspaceMembers($first: Int!) {
        workspaceMembers(first: $first) {
          edges {
            node {
              id
              name {
                firstName
                lastName
              }
              userEmail
              avatarUrl
              locale
              timeZone
              dateFormat
              timeFormat
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { first: limit });
    
    const members = data.data.workspaceMembers.edges;
    return {
      content: [
        {
          type: 'text',
          text: `Found ${members.length} workspace members:\n\n${
            members.map(edge => {
              const m = edge.node;
              return `👤 ${m.name.firstName} ${m.name.lastName}\n` +
                     `   📧 ${m.userEmail}\n` +
                     `   🌍 Locale: ${m.locale}\n` +
                     `   🕐 Timezone: ${m.timeZone}\n` +
                     `   📅 Date format: ${m.dateFormat}\n` +
                     `   ⏰ Time format: ${m.timeFormat}\n` +
                     `   🆔 ${m.id}`;
            }).join('\n\n')
          }`
        }
      ]
    };
  }

  // ========== SEARCH & ANALYTICS ==========
  async globalSearch({ query: searchQuery, types = ['companies', 'people'], limit = 10 }) {
    const results = [];

    for (const type of types) {
      switch (type) {
        case 'companies':
          const companiesData = await this.makeGraphQLRequest(`
            query SearchCompanies($filter: CompanyFilterInput!, $first: Int!) {
              companies(filter: $filter, first: $first) {
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
          `, {
            filter: {
              or: [
                { name: { ilike: `%${searchQuery}%` } },
                { domainName: { primaryLinkUrl: { ilike: `%${searchQuery}%` } } }
              ]
            },
            first: limit
          });
          
          if (companiesData.data.companies.edges.length > 0) {
            results.push(`🏢 Companies:\n${
              companiesData.data.companies.edges.map(e => 
                `   - ${e.node.name} (${e.node.domainName?.primaryLinkUrl || 'No website'})`
              ).join('\n')
            }`);
          }
          break;

        case 'people':
          const peopleData = await this.makeGraphQLRequest(`
            query SearchPeople($filter: PersonFilterInput!, $first: Int!) {
              people(filter: $filter, first: $first) {
                edges {
                  node {
                    id
                    name {
                      firstName
                      lastName
                    }
                    email
                    company {
                      name
                    }
                  }
                }
              }
            }
          `, {
            filter: {
              or: [
                { name: { firstName: { ilike: `%${searchQuery}%` } } },
                { name: { lastName: { ilike: `%${searchQuery}%` } } },
                { email: { ilike: `%${searchQuery}%` } }
              ]
            },
            first: limit
          });
          
          if (peopleData.data.people.edges.length > 0) {
            results.push(`👤 People:\n${
              peopleData.data.people.edges.map(e => 
                `   - ${e.node.name.firstName} ${e.node.name.lastName} (${e.node.email || 'No email'})${
                  e.node.company ? ` at ${e.node.company.name}` : ''
                }`
              ).join('\n')
            }`);
          }
          break;

        case 'opportunities':
          const oppsData = await this.makeGraphQLRequest(`
            query SearchOpportunities($filter: OpportunityFilterInput!, $first: Int!) {
              opportunities(filter: $filter, first: $first) {
                edges {
                  node {
                    id
                    name
                    stage
                    company {
                      name
                    }
                  }
                }
              }
            }
          `, {
            filter: {
              name: { ilike: `%${searchQuery}%` }
            },
            first: limit
          });
          
          if (oppsData.data.opportunities.edges.length > 0) {
            results.push(`💼 Opportunities:\n${
              oppsData.data.opportunities.edges.map(e => 
                `   - ${e.node.name} (${e.node.stage})${
                  e.node.company ? ` at ${e.node.company.name}` : ''
                }`
              ).join('\n')
            }`);
          }
          break;

        case 'tasks':
          const tasksData = await this.makeGraphQLRequest(`
            query SearchTasks($filter: TaskFilterInput!, $first: Int!) {
              tasks(filter: $filter, first: $first) {
                edges {
                  node {
                    id
                    title
                    status
                  }
                }
              }
            }
          `, {
            filter: {
              or: [
                { title: { ilike: `%${searchQuery}%` } },
                { body: { ilike: `%${searchQuery}%` } }
              ]
            },
            first: limit
          });
          
          if (tasksData.data.tasks.edges.length > 0) {
            results.push(`📝 Tasks:\n${
              tasksData.data.tasks.edges.map(e => 
                `   - ${e.node.title} (${e.node.status})`
              ).join('\n')
            }`);
          }
          break;

        case 'notes':
          const notesData = await this.makeGraphQLRequest(`
            query SearchNotes($filter: NoteFilterInput!, $first: Int!) {
              notes(filter: $filter, first: $first) {
                edges {
                  node {
                    id
                    title
                    body
                  }
                }
              }
            }
          `, {
            filter: {
              or: [
                { title: { ilike: `%${searchQuery}%` } },
                { body: { ilike: `%${searchQuery}%` } }
              ]
            },
            first: limit
          });
          
          if (notesData.data.notes.edges.length > 0) {
            results.push(`📄 Notes:\n${
              notesData.data.notes.edges.map(e => 
                `   - ${e.node.title || 'Untitled'}: ${e.node.body.substring(0, 50)}...`
              ).join('\n')
            }`);
          }
          break;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: results.length > 0 ? 
            `🔍 Search results for "${searchQuery}":\n\n${results.join('\n\n')}` :
            `No results found for "${searchQuery}"`
        }
      ]
    };
  }

  async getAnalytics(type = 'recent_activity') {
    switch (type) {
      case 'opportunities_by_stage':
        const oppsData = await this.makeGraphQLRequest(`
          query GetOpportunitiesAnalytics {
            opportunities {
              edges {
                node {
                  stage
                  amount {
                    amountMicros
                  }
                }
              }
            }
          }
        `);

        const stageStats = {};
        oppsData.data.opportunities.edges.forEach(e => {
          const stage = e.node.stage;
          if (!stageStats[stage]) {
            stageStats[stage] = { count: 0, totalAmount: 0 };
          }
          stageStats[stage].count++;
          if (e.node.amount?.amountMicros) {
            stageStats[stage].totalAmount += e.node.amount.amountMicros / 1000000;
          }
        });

        return {
          content: [
            {
              type: 'text',
              text: `📊 Opportunities by Stage:\n\n${
                Object.entries(stageStats).map(([stage, stats]) => 
                  `${stage}:\n   Count: ${stats.count}\n   Total Value: $${stats.totalAmount.toFixed(2)}`
                ).join('\n\n')
              }`
            }
          ]
        };

      case 'tasks_by_status':
        const tasksData = await this.makeGraphQLRequest(`
          query GetTasksAnalytics {
            tasks {
              edges {
                node {
                  status
                }
              }
            }
          }
        `);

        const statusStats = {};
        tasksData.data.tasks.edges.forEach(e => {
          const status = e.node.status;
          statusStats[status] = (statusStats[status] || 0) + 1;
        });

        return {
          content: [
            {
              type: 'text',
              text: `📊 Tasks by Status:\n\n${
                Object.entries(statusStats).map(([status, count]) => 
                  `${status}: ${count} tasks`
                ).join('\n')
              }`
            }
          ]
        };

      case 'recent_activity':
      default:
        const activitiesData = await this.makeGraphQLRequest(`
          query GetRecentActivities {
            timelineActivities(first: 10, orderBy: [{createdAt: DESC}]) {
              edges {
                node {
                  id
                  name
                  properties
                  createdAt
                }
              }
            }
          }
        `);

        return {
          content: [
            {
              type: 'text',
              text: `📊 Recent Activity:\n\n${
                activitiesData.data.timelineActivities.edges.map(e => {
                  const a = e.node;
                  return `• ${a.name}\n  ${new Date(a.createdAt).toLocaleString()}`;
                }).join('\n\n')
              }`
            }
          ]
        };
    }
  }

  // ========== CUSTOM QUERY ==========
  async executeCustomQuery(query, variables = {}) {
    const data = await this.makeGraphQLRequest(query, variables);
    
    return {
      content: [
        {
          type: 'text',
          text: `Query executed successfully!\n\nResult:\n${JSON.stringify(data.data, null, 2)}`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Twenty MCP Server (Full Access) running...');
  }
}

// Démarrer le serveur
const server = new TwentyMCPServerFull();
server.run().catch(console.error);