import { NextResponse } from 'next/server';

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Skills Radar MCP API',
    description: 'Internal MCP Server API for accessing skills and member data',
    version: '1.0.0',
    contact: {
      name: 'Skills Radar Team',
    },
  },
  servers: [
    {
      url: '/api/mcp',
      description: 'MCP API Server',
    },
  ],
  security: [
    {
      ApiKeyAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key for authentication',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Error timestamp',
          },
        },
        required: ['error', 'timestamp'],
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          data: {
            description: 'Response data',
          },
          metadata: {
            type: 'object',
            description: 'Response metadata',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Response timestamp',
          },
        },
        required: ['data', 'timestamp'],
      },
      Skill: {
        type: 'object',
        properties: {
          skill_id: {
            type: 'integer',
            description: 'Unique skill identifier',
          },
          skill_name: {
            type: 'string',
            description: 'Name of the skill',
          },
          skill_purpose: {
            type: 'string',
            nullable: true,
            description: 'Purpose or description of the skill',
          },
          knowledge_area: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
            },
          },
          category: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              grouping_criteria: { type: 'string', nullable: true },
            },
          },
          scale: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              type: { type: 'string' },
              values: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
        required: ['skill_id', 'skill_name'],
      },
      Member: {
        type: 'object',
        properties: {
          member_id: {
            type: 'integer',
            description: 'Unique member identifier',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Member email address',
          },
          full_name: {
            type: 'string',
            nullable: true,
            description: 'Member full name',
          },
          hire_date: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Member hire date',
          },
          current_client: {
            type: 'string',
            nullable: true,
            description: 'Current client assignment',
          },
          category: {
            type: 'string',
            nullable: true,
            description: 'Member category (e.g., Starter, Builder, Solver, Wizard)',
          },
          location: {
            type: 'string',
            nullable: true,
            description: 'Member location',
          },
        },
        required: ['member_id', 'email'],
      },
    },
  },
  paths: {
    '/skills': {
      get: {
        summary: 'Get all skills',
        description: 'Returns all skills with categories and knowledge areas',
        parameters: [
          {
            name: 'knowledge_area_id',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filter by knowledge area ID',
          },
          {
            name: 'category_id',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filter by skill category ID',
          },
          {
            name: 'include_members',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Include member information for each skill',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 100 },
            description: 'Maximum number of results to return',
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
            description: 'Number of results to skip',
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Skill' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
        security: [{ ApiKeyAuth: [] }],
        tags: ['Skills'],
      },
    },
    '/members': {
      get: {
        summary: 'Get all members',
        description: 'Returns all members with filters by knowledge area, skill, and client',
        parameters: [
          {
            name: 'knowledge_area_id',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filter by knowledge area ID',
          },
          {
            name: 'skill_id',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filter by skill ID',
          },
          {
            name: 'current_client',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by current client',
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by member category',
          },
          {
            name: 'min_expertise_level',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filter by minimum expertise level',
          },
          {
            name: 'include_skills',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Include skill information for each member',
          },
          {
            name: 'include_profile',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Include profile information for each member',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 100 },
            description: 'Maximum number of results to return',
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
            description: 'Number of results to skip',
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Member' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
        security: [{ ApiKeyAuth: [] }],
        tags: ['Members'],
      },
    },
    '/dashboards/summary': {
      get: {
        summary: 'Get dashboard summary',
        description: 'Returns aggregated insights such as count of members per knowledge area or tech category',
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            overview: {
                              type: 'object',
                              properties: {
                                total_members: { type: 'integer' },
                                total_skills: { type: 'integer' },
                                total_knowledge_areas: { type: 'integer' },
                                total_skill_categories: { type: 'integer' },
                                total_skill_assessments: { type: 'integer' },
                              },
                            },
                            members_by_knowledge_area: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  knowledge_area_id: { type: 'integer' },
                                  knowledge_area_name: { type: 'string' },
                                  unique_members_count: { type: 'integer' },
                                  skills_count: { type: 'integer' },
                                },
                              },
                            },
                            members_by_skill_category: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  category_id: { type: 'integer' },
                                  category_name: { type: 'string' },
                                  unique_members_count: { type: 'integer' },
                                  skills_count: { type: 'integer' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
        security: [{ ApiKeyAuth: [] }],
        tags: ['Dashboards'],
      },
    },
  },
  tags: [
    {
      name: 'Skills',
      description: 'Operations related to skills',
    },
    {
      name: 'Members',
      description: 'Operations related to members',
    },
    {
      name: 'Dashboards',
      description: 'Operations related to dashboard data',
    },
  ],
};

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}