import { z } from 'zod';

export const getGreetingsQuery = z.object({ name: z.string() });
export type GetGreetingsQuery = z.infer<typeof getGreetingsQuery>;
export type GetGreetingsReturn = string;
