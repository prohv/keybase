import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return Response.json({
    message: 'KeyBase API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: '/api/auth/login (POST)',
        register: '/api/auth/register (POST)',
      },
      team: {
        create: '/api/team/create (POST)',
        join: '/api/team/join (POST)',
      },
      apiKey: {
        create: '/api/api-key/create (POST)',
        list: '/api/api-key/list (GET)',
        reveal: '/api/api-key/reveal (POST)',
        delete: '/api/api-key/delete (DELETE)',
      },
    },
    documentation: '/api-docs (Swagger UI)',
  });
}