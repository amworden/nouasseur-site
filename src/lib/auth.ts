import { Elysia } from 'elysia';
import { verifyToken } from '../api/users';
import { JwtPayload } from 'jsonwebtoken';

// Define the user interface
export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

// Authentication middleware for Elysia
export const authMiddleware = new Elysia()
  .derive(({ cookie, set, request }) => {
    // Get token from cookie - try multiple approaches
    // First try the value property, then direct access
    const token = cookie.auth?.value || cookie.auth;
    
    if (!token) {
      return {
        user: null,
        isAuthenticated: false
      };
    }
    
    // Verify JWT
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return {
        user: null,
        isAuthenticated: false
      };
    }

    // Ensure decoded has the expected shape
    const user = decoded as AuthUser;
    
    return {
      user,
      isAuthenticated: true
    };
  });

// Middleware to require authentication for protected routes
export const requireAuth = new Elysia()
  .use(authMiddleware)
  .derive(({ isAuthenticated, set, path }) => {
    if (!isAuthenticated && !path.startsWith('/api/')) {
      // For non-API routes, redirect to login page
      set.headers['Location'] = '/login?redirectTo=' + encodeURIComponent(path);
      set.status = 302;
      return 'Redirecting to login...';
    }
    
    if (!isAuthenticated && path.startsWith('/api/')) {
      // For API routes, return unauthorized status
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
  }); 