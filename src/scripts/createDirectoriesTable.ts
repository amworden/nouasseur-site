#!/usr/bin/env bun

import { Pool } from 'pg';
import { db } from '../db';
import { directories } from '../db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';

// Configuration details from env variables or defaults
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/nouasseur_events';

// Create a PostgreSQL connection pool
const pool = new Pool({ connectionString });

async function createDirectoriesTable() {
  try {
    console.log('Creating directories table...');

    // Generate the SQL for creating the directories table
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS directories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      position VARCHAR(255),
      organization VARCHAR(255),
      department VARCHAR(255),
      address VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(50),
      zip_code VARCHAR(20),
      country VARCHAR(100),
      phone VARCHAR(50),
      email VARCHAR(255),
      website VARCHAR(255),
      category VARCHAR(100),
      sub_category VARCHAR(100),
      description TEXT,
      notes TEXT,
      sort_order INTEGER,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;

    // Connect to the database
    console.log('Connecting to the database...');
    const client = await pool.connect();
    
    try {
      // Execute the SQL
      console.log('Executing SQL to create directories table...');
      await client.query(createTableSQL);
      console.log('Directories table created successfully!');
    } finally {
      // Release the client back to the pool
      client.release();
    }

  } catch (error) {
    console.error('Error creating directories table:', error);
    throw error;
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
createDirectoriesTable()
  .then(() => {
    console.log('Table creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Table creation failed:', error);
    process.exit(1);
  }); 