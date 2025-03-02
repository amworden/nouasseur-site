import { Elysia, t } from 'elysia';
import { db } from '../db';
import { users, type NewUser } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// JWT Secret - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'nouasseur-super-secret-jwt-key';
const JWT_EXPIRES_IN = '24h';

// Define login schema for request validation
const loginSchema = t.Object({
  username: t.String(),
  password: t.String()
});

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
      // Type assertion for the body
      const typedBody = body as { username: string, email: string, password: string };
      
      // Check if user already exists with either the same email or username
      const existingUserByEmail = await db.select()
        .from(users)
        .where(eq(users.email, typedBody.email))
        .limit(1);
        
      const existingUserByUsername = await db.select()
        .from(users)
        .where(eq(users.username, typedBody.username))
        .limit(1);
        
      if (existingUserByEmail.length > 0 || existingUserByUsername.length > 0) {
        return { 
          success: false, 
          error: 'User with this email or username already exists' 
        };
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(typedBody.password, 10);
      
      // Create new user
      const newUser = await db.insert(users).values({
        username: typedBody.username,
        email: typedBody.email,
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
  .post('/login', async ({ body, set, query }) => {
    try {
      // Get the redirect URLs
      const redirectSuccess = query?.redirectUrl || '/members';
      const redirectFailure = `/login?error=${encodeURIComponent('Invalid username or password')}&redirectTo=${encodeURIComponent(redirectSuccess)}`;
      const useServerRedirect = query?.serverRedirect === 'true';
      
      // Type assertion for the body
      const typedBody = body as { username: string, password: string };
      
      // Find user by username or email
      const user = await db.select()
        .from(users)
        .where(or(
          eq(users.email, typedBody.username),
          eq(users.username, typedBody.username)
        ))
        .limit(1);
        
      if (user.length === 0) {
        if (useServerRedirect) {
          // Handle server-side redirect for failure
          set.headers['Location'] = redirectFailure;
          set.status = 302;
          return 'Redirecting to login...';
        }
        
        set.status = 401;
        return { success: false, error: 'Invalid username or password' };
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(
        typedBody.password, 
        user[0].passwordHash
      );
      
      if (!isPasswordValid) {
        if (useServerRedirect) {
          // Handle server-side redirect for failure
          set.headers['Location'] = redirectFailure;
          set.status = 302;
          return 'Redirecting to login...';
        }
        
        set.status = 401;
        return { success: false, error: 'Invalid username or password' };
      }
      
      // Generate JWT token
      const token = jwt.sign(
        {
          id: user[0].id,
          username: user[0].username,
          email: user[0].email
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // Set auth cookie using the Set-Cookie header instead of direct cookie access
      set.headers['Set-Cookie'] = `auth=${token}; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax`;
      
      console.log('Login successful for user:', user[0].username);
      
      // Handle server-side redirect if requested
      if (useServerRedirect) {
        set.headers['Location'] = redirectSuccess;
        set.status = 302;
        return 'Redirecting...';
      }
      
      // Return success response with redirect info for client-side redirect
      return { 
        success: true, 
        data: {
          id: user[0].id,
          username: user[0].username,
          email: user[0].email
        },
        redirectTo: redirectSuccess
      };
    } catch (error) {
      console.error('Error during login:', error);
      
      // Handle server-side redirect for error case
      if (query?.serverRedirect === 'true') {
        const redirectError = `/login?error=${encodeURIComponent('Server error occurred')}&redirectTo=${encodeURIComponent(query?.redirectUrl || '/members')}`;
        set.headers['Location'] = redirectError;
        set.status = 302;
        return 'Redirecting to login...';
      }
      
      set.status = 500;
      return { success: false, error: 'Failed to login' };
    }
  }, {
    body: t.Object({
      username: t.String(),
      password: t.String()
    }),
    query: t.Optional(t.Object({
      redirectUrl: t.Optional(t.String()),
      serverRedirect: t.Optional(t.String())
    }))
  })
  
  // Logout
  .post('/logout', ({ set }) => {
    try {
      // Clear auth cookie using Set-Cookie header
      set.headers['Set-Cookie'] = 'auth=; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Redirect to login page
      set.headers['Location'] = '/login';
      set.status = 302;
      return 'Redirecting to login...';
    } catch (error) {
      console.error('Error during logout:', error);
      set.status = 500;
      return { success: false, error: 'Failed to logout' };
    }
  });

// Helper functions for auth
export function generateToken(user: { id: number, username: string, email: string }) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
} 