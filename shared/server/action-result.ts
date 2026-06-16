import { AppError } from './errors';
import { AuthError } from '@/lib/jwt';
import { ZodError } from 'zod';

export function handleActionError(error: unknown): { error: string } {
  if (error instanceof ZodError) {
    return { error: error.issues[0].message };
  }
  if (error instanceof AppError) {
    return { error: error.message };
  }
  if (error instanceof AuthError) {
    return { error: error.message };
  }
  
  const err = error as { name?: string };
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return { error: 'Invalid or expired session' };
  }

  console.error('[Action Error]:', error);
  return { error: 'An unexpected error occurred' };
}
