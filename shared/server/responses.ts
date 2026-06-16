import { AppError } from './errors';
import { AuthError } from '@/lib/jwt';
import { ZodError } from 'zod';

export function jsonOk(data: Record<string, unknown> = {}) {
  return Response.json({ success: true, ...data });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json({ error: error.issues[0].message }, { status: 400 });
  }
  if (error instanceof AppError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  
  const err = error as { name?: string; message?: string; status?: number; code?: string };
  // Check for common JWT errors from jsonwebtoken library
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  console.error('[API Error]:', error);
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
