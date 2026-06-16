import { z } from 'zod';

export const createTokenSchema = z.object({
  projectId: z.number().min(1),
  name: z.string().min(1).max(100),
  expiryDays: z.number().min(1).max(365).nullable().optional(),
});

export const revokeTokenSchema = z.object({
  tokenId: z.number().min(1),
});
