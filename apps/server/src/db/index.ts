import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// This is a placeholder database setup for Gmail-only mode
// In production, this would connect to a real database
export function createDb(connectionString?: string) {
  if (!connectionString) {
    // Return a mock database for demo mode
    return {
      db: {} as any,
      client: null,
    };
  }
  
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });
  
  return { db, client };
} 