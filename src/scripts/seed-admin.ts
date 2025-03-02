import { db } from '../db';
import { users } from '../db/schema';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function seedAdmin() {
  try {
    console.log('Checking if admin user exists...');
    
    // Check if admin user already exists
    const existingAdmin = await db.select()
      .from(users)
      .where(eq(users.username, 'admin'))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('Admin user already exists!');
      return;
    }
    
    console.log('Creating admin user...');
    
    // Hash the password
    const passwordHash = await bcrypt.hash('admin', 10);
    
    // Create admin user
    await db.insert(users).values({
      username: 'admin',
      email: 'admin@nouasseur.example.com',
      passwordHash
    });
    
    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedAdmin(); 