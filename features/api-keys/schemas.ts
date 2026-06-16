import { z } from 'zod';

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  key: z.string().min(1, 'API Key is required'),
  projectId: z.number().min(1),
});

export const deleteApiKeySchema = z.object({
  keyId: z.number().min(1),
});

export const revealApiKeySchema = z.object({
  keyId: z.number().min(1),
});
