import { z } from 'zod';
import { insertGenerationSchema, generations } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
    error: z.string().optional()
  }),
};

export const api = {
  generate: {
    method: 'POST' as const,
    path: '/api/generate' as const,
    input: z.object({
      prompt: z.string().min(1, "Prompt is required"),
    }),
    responses: {
      200: z.object({ response: z.string() }),
      400: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}

export type GenerateInput = z.infer<typeof api.generate.input>;
export type GenerateResponse = z.infer<typeof api.generate.responses[200]>;