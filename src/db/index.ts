import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Configuration details should be in environment variables in production
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/nouasseur_events';

// Create a PostgreSQL connection pool
const pool = new Pool({ 
  connectionString,
  // Add connection timeout and retry settings
  connectionTimeoutMillis: 5000,
  // Add keep-alive to prevent idle connection termination
  keepAlive: true
});

// Connect with retry logic
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

let connected = false;
let retries = 0;

async function connectWithRetry() {
  while (retries < MAX_RETRIES && !connected) {
    try {
      console.log(`Attempting to connect to database (attempt ${retries + 1}/${MAX_RETRIES})...`);
      // Test connection by getting a client from the pool
      const client = await pool.connect();
      client.release(); // Release the client back to the pool
      connected = true;
      console.log('Successfully connected to the database!');
    } catch (error) {
      retries++;
      console.error(`Failed to connect to database (attempt ${retries}/${MAX_RETRIES}):`, error);
      
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY_MS/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error('Maximum number of connection attempts reached. Exiting.');
        process.exit(1);
      }
    }
  }
}

// Initialize connection
connectWithRetry();

// Create Drizzle instance using node-postgres adapter
export const db = drizzle(pool, { schema });

// Helper function to close the database connection if needed
export async function closeDb() {
  await pool.end();
} 