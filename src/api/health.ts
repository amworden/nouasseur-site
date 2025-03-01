import { Elysia } from 'elysia';
import { db } from '../db';
import { sql } from 'drizzle-orm';

export const healthApi = new Elysia({ prefix: '/api/health' })
  // Health check endpoint
  .get('/', async () => {
    try {
      // Simple query to check database connectivity
      const result = await db.execute(sql`SELECT 1 as health`);
      return { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: {
          connected: true
        }
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error.message
        }
      };
    }
  }); 