import { AppError } from './errors';
import { AuthError } from '@/lib/jwt';

export function handleActionError(error: unknown): { error: string } {
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
