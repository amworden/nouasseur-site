import { Elysia, t } from 'elysia';
import { db } from '../db';
import { users, type NewUser } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

export const usersApi = new Elysia({ prefix: '/api/users' })
  // Get all users (admin only in a real app)
  .get('/', async () => {
    try {
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt
      }).from(users);
      
      return { success: true, data: allUsers };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: 'Failed to fetch users' };
    }
  })
  
  // Get user by id
  .get('/:id', async ({ params }) => {
    try {
      const user = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, parseInt(params.id)))
      .limit(1);
      
      if (user.length === 0) {
        return { success: false, error: 'User not found' };
      }
      
      return { success: true, data: user[0] };
    } catch (error) {
      console.error(`Error fetching user with ID ${params.id}:`, error);
      return { success: false, error: 'Failed to fetch user' };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  
  // Register a new user
  .post('/register', async ({ body }) => {
    try {
      // Check if user already exists with either the same email or username
      const existingUserByEmail = await db.select()
        .from(users)
        .where(eq(users.email, body.email))
        .limit(1);
        
      const existingUserByUsername = await db.select()
        .from(users)
        .where(eq(users.username, body.username))
        .limit(1);
        
      if (existingUserByEmail.length > 0 || existingUserByUsername.length > 0) {
        return { 
          success: false, 
          error: 'User with this email or username already exists' 
        };
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(body.password, 10);
      
      // Create new user
      const newUser = await db.insert(users).values({
        username: body.username,
        email: body.email,
        passwordHash
      }).returning({
        id: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt
      });
      
      return { success: true, data: newUser[0] };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  
  // Login
  .post('/login', async ({ body }) => {
    try {
      // Find user by email
      const user = await db.select()
        .from(users)
        .where(eq(users.email, body.email))
        .limit(1);
        
      if (user.length === 0) {
        return { success: false, error: 'Invalid email or password' };
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(
        body.password, 
        user[0].passwordHash
      );
      
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid email or password' };
      }
      
      // In a real app, you would generate a JWT token here
      
      return { 
        success: true, 
        data: {
          id: user[0].id,
          username: user[0].username,
          email: user[0].email
        }
      };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: 'Failed to login' };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  }); 