import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(3).max(50),
});

export const joinTeamSchema = z.object({
  code: z.string().min(4).max(12).toUpperCase(),
});
