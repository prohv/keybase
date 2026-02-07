import { NextRequest } from 'next/server';

// OpenAPI specification
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'KeyBase API',
    version: '1.0.0',
    description: 'Secure Team API Key Vault - API Documentation',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
    {
      url: 'https://your-deployment-url.com/api',
      description: 'Production server',
    },
  ],
  paths: {
    '/auth/login': {
      post: {
        summary: 'User Login',
        description: 'Authenticate user and return JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'user@example.com',
                  },
                  password: {
                    type: 'string',
                    minLength: 8,
                    example: 'securePassword123',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successful login',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 1 },
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - invalid input',
          },
          '401': {
            description: 'Unauthorized - invalid credentials',
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'User Registration',
        description: 'Register a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'newuser@example.com',
                  },
                  password: {
                    type: 'string',
                    minLength: 8,
                    example: 'securePassword123',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successful registration',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 2 },
                        email: { type: 'string', format: 'email', example: 'newuser@example.com' },
                        role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - invalid input',
          },
          '409': {
            description: 'Conflict - email already exists',
          },
        },
      },
    },
    '/team/create': {
      post: {
        summary: 'Create Team',
        description: 'Create a new team and become its admin',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: {
                    type: 'string',
                    minLength: 3,
                    maxLength: 50,
                    example: 'Engineering Team',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Team created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    team: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Engineering Team' },
                        teamCode: { type: 'string', example: 'A1B2C3D4' },
                        createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - invalid input',
          },
          '401': {
            description: 'Unauthorized - invalid token',
          },
        },
      },
    },
    '/team/join': {
      post: {
        summary: 'Join Team',
        description: 'Join an existing team using a team code',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code'],
                properties: {
                  code: {
                    type: 'string',
                    minLength: 4,
                    maxLength: 12,
                    example: 'A1B2C3D4',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successfully joined team',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string', example: 'Successfully joined team' },
                    team: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Engineering Team' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - invalid code format',
          },
          '401': {
            description: 'Unauthorized - invalid token',
          },
          '404': {
            description: 'Not found - invalid team code',
          },
          '409': {
            description: 'Conflict - already member of team',
          },
        },
      },
    },
    '/api-key/create': {
      post: {
        summary: 'Create API Key',
        description: 'Create a new encrypted API key for a team',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'key', 'teamId'],
                properties: {
                  name: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 100,
                    example: 'Production API Key',
                  },
                  key: {
                    type: 'string',
                    minLength: 1,
                    example: 'sk-1234567890abcdef',
                  },
                  teamId: {
                    type: 'integer',
                    minimum: 1,
                    example: 1,
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'API key created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    apiKey: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Production API Key' },
                        teamId: { type: 'integer', example: 1 },
                        createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - invalid input',
          },
          '401': {
            description: 'Unauthorized - invalid token',
          },
          '403': {
            description: 'Forbidden - not a member of the team',
          },
        },
      },
    },
    '/api-key/list': {
      get: {
        summary: 'List API Keys',
        description: 'List all API keys for a specific team',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'teamId',
            in: 'query',
            required: true,
            schema: {
              type: 'integer',
              minimum: 1,
              example: 1,
            },
          },
        ],
        responses: {
          '200': {
            description: 'List of API keys',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', example: 1 },
                          name: { type: 'string', example: 'Production API Key' },
                          createdBy: { type: 'integer', example: 1 },
                          createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - missing teamId',
          },
          '401': {
            description: 'Unauthorized - invalid token',
          },
          '403': {
            description: 'Forbidden - not a member of the team',
          },
        },
      },
    },
    '/api-key/reveal': {
      post: {
        summary: 'Reveal API Key',
        description: 'Decrypt and reveal an API key',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['keyId'],
                properties: {
                  keyId: {
                    type: 'integer',
                    example: 1,
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'API key revealed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'string', example: 'sk-1234567890abcdef' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - invalid keyId',
          },
          '401': {
            description: 'Unauthorized - invalid token',
          },
          '403': {
            description: 'Forbidden - no permission to reveal key',
          },
          '404': {
            description: 'Not found - API key not found',
          },
        },
      },
    },
    '/api-key/delete': {
      delete: {
        summary: 'Delete API Key',
        description: 'Delete an API key permanently',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['keyId'],
                properties: {
                  keyId: {
                    type: 'integer',
                    example: 1,
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'API key deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string', example: 'API key deleted successfully' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - invalid keyId',
          },
          '401': {
            description: 'Unauthorized - invalid token',
          },
          '403': {
            description: 'Forbidden - no permission to delete key',
          },
          '404': {
            description: 'Not found - API key not found',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

export async function GET(req: NextRequest) {
  return Response.json(openApiSpec);
}