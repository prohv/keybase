import { z } from 'zod';

export const createProjectSchema = z.object({
  teamId: z.number().min(1),
  name: z.string().min(1).max(100),
});

export const deleteProjectSchema = z.object({
  projectId: z.number().min(1),
});
