import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { cookie } from '@elysiajs/cookie';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { Layout } from './components/Layout';
import { EventsPage } from './components/EventsPage';
import { MembersPage } from './components/MembersPage';
import { DirectoryPage } from './components/DirectoryPage';
import { LoginPage } from './components/LoginPage';
import { db } from './db';
import { events, members, directories } from './db/schema';
import { eventsApi } from './api/events';
import { usersApi } from './api/users';
import { healthApi } from './api/health';
import { membersApi } from './api/members';
import { directoriesApi } from './api/directories';
import { authMiddleware, requireAuth } from './lib/auth';
import * as fs from 'fs';
import { join } from 'path';
import { sql } from 'drizzle-orm';
import './styles/globals.css';

// Create reusable HTML page template component
const HtmlPage = ({ title, content }) => `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="/styles.css">
    <script src="https://unpkg.com/htmx.org@1.9.3"></script>
    <script src="https://unpkg.com/htmx.org/dist/ext/json-enc.js"></script>
    <script src="/modal.js" defer></script>
  </head>
  <body class="min-h-screen bg-background text-foreground dark">
    <div id="app">${content}</div>
  </body>
</html>`;

// Error page component
const ErrorPage = ({ title, message, error }) => `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Nouasseur Events</title>
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body class="min-h-screen bg-background text-foreground dark">
    <div id="app">
      <div class="container mx-auto px-4 py-16 text-center">
        <h1 class="text-4xl font-bold mb-4">${message}</h1>
        <p class="text-muted-foreground">We're experiencing technical difficulties. Please try again later.</p>
        ${error ? `<pre class="mt-4 bg-secondary p-4 rounded-md overflow-auto text-left">${error}</pre>` : ''}
        <p class="mt-6"><a href="/" class="text-primary hover:underline">Try again</a></p>
      </div>
    </div>
  </body>
</html>`;

// Home page content component
const HomePage = ({ events, user, isAuthenticated }) => (
  <Layout user={user} isAuthenticated={isAuthenticated}>
    <div className="container mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-bold">Welcome to Nouasseur Events</h1>
        <p className="text-xl text-muted-foreground">
          Discover and participate in our exciting community events
        </p>
      </div>
      
      <h2 className="mb-6 text-2xl font-bold">Featured Events</h2>
      
      <EventsPage events={events} />
    </div>
  </Layout>
);

// All events page content component
const EventsPageWrapper = ({ events, initialPage, initialPageSize, totalCount, totalPages, user, isAuthenticated }) => (
  <Layout user={user} isAuthenticated={isAuthenticated}>
    <div className="container mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-bold">Upcoming Events</h1>
        <p className="text-xl text-muted-foreground">
          Discover and participate in our exciting community events
        </p>
      </div>
      
      <EventsPage 
        events={events} 
        initialPage={initialPage}
        initialPageSize={initialPageSize}
        totalCount={totalCount}
        totalPages={totalPages}
      />
    </div>
  </Layout>
);

// Directory page route
const DirectoryPageRoute = async () => {
  try {
    // Get directories with pagination
    const page = 1;
    const pageSize = 9;
    const offset = (page - 1) * pageSize;

    const [directoryData, countResult, categories] = await Promise.all([
      db.select().from(directories)
        .limit(pageSize)
        .offset(offset)
        .orderBy(directories.sortOrder, directories.name),
      db.select({ count: sql<number>`count(*)` }).from(directories),
      db.selectDistinct({ category: directories.category })
        .from(directories)
        .where(sql`${directories.category} is not null`)
    ]);

    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    const categoryList = categories.map(cat => cat.category).filter(Boolean);

    // Render the directory page
    const directoryPageHtml = renderToString(
      <DirectoryPage 
        directories={directoryData} 
        categories={categoryList}
        initialPage={page}
        initialPageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
      />
    );

    return new Response(HtmlPage({
      title: 'Directory | Nouasseur Alumni Association',
      content: directoryPageHtml
    }), {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('Error rendering directory page:', error);
    return new Response(ErrorPage({
      title: 'Error',
      message: 'Failed to load directory',
      error: process.env.NODE_ENV === 'development' ? error.stack : null
    }), {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
};

// Create a base app with shared plugins
const app = new Elysia()
  .use(cors())
  .use(staticPlugin({
    assets: 'public',
    prefix: ''
  }))
  
  // Add explicit routes for static files with proper content types
  .get('/styles.css', () => {
    try {
      const content = fs.readFileSync(join(process.cwd(), 'public', 'styles.css'), 'utf8');
      return new Response(content, {
        headers: {
          'Content-Type': 'text/css',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } catch (error) {
      console.error('Error serving styles.css:', error);
      return new Response('/* CSS not found */', {
        headers: {
          'Content-Type': 'text/css',
          'Status': '404'
        },
        status: 404
      });
    }
  })
  
  .get('/modal.js', () => {
    try {
      const content = fs.readFileSync(join(process.cwd(), 'public', 'modal.js'), 'utf8');
      return new Response(content, {
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } catch (error) {
      console.error('Error serving modal.js:', error);
      return new Response('/* JavaScript not found */', {
        headers: {
          'Content-Type': 'application/javascript',
          'Status': '404'
        },
        status: 404
      });
    }
  })
  
  .use(cookie())
  .use(authMiddleware)
  .use(healthApi)
  .use(usersApi)
  
  // Home page route - no auth required
  .get('/', async ({ set, isAuthenticated, user }) => {
    try {
      // Set content type header to ensure browser renders as HTML
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      
      // Get upcoming events for home page
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of today
      
      const upcomingEvents = await db.select().from(events)
        .where(sql`${events.eventDatebeg} >= ${today.toISOString()}`)
        .orderBy(events.eventDatebeg)
        .limit(3);
      
      const pageContent = renderToString(
        <HomePage events={upcomingEvents} user={user} isAuthenticated={isAuthenticated} />
      );
      
      return HtmlPage({ 
        title: 'Nouasseur Events', 
        content: pageContent 
      });
    } catch (error) {
      console.error('Error rendering home page:', error);
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      return ErrorPage({ 
        title: 'Error', 
        message: 'Error Loading Page', 
        error: error.message 
      });
    }
  })
  
  // Login page route - no auth required
  .get('/login', async ({ set, query, cookie, isAuthenticated, user }) => {
    try {
      // If already authenticated, redirect to home page
      if (isAuthenticated) {
        set.headers['Location'] = '/';
        set.status = 302;
        return 'Redirecting to home...';
      }
      
      // Set content type header to ensure browser renders as HTML
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      
      const redirectTo = query?.redirectTo || '/';
      const error = query?.error || '';
      
      const pageContent = renderToString(
        <LoginPage error={error} redirectTo={redirectTo} />
      );
      
      return HtmlPage({ 
        title: 'Login | Nouasseur Events', 
        content: pageContent 
      });
    } catch (error) {
      console.error('Error rendering login page:', error);
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      return ErrorPage({ 
        title: 'Error', 
        message: 'Error Loading Login Page', 
        error: error.message 
      });
    }
  }, {
    query: t.Optional(t.Object({
      redirectTo: t.Optional(t.String()),
      error: t.Optional(t.String())
    }))
  });

// Create a separate app for protected routes
const protectedApp = new Elysia()
  .use(app)
  .use(requireAuth)
  .use(eventsApi)
  .use(membersApi)
  .use(directoriesApi)
  
  // Debug route for testing auth
  .get('/auth-status', ({ isAuthenticated, user, set }) => {
    set.headers['Content-Type'] = 'application/json';
    return {
      isAuthenticated,
      user,
      timestamp: new Date().toISOString()
    };
  })
  
  // Events page route - protected
  .get('/events', async ({ set, query, isAuthenticated, user }) => {
    try {
      // Set content type header to ensure browser renders as HTML
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      
      const page = parseInt(query?.page || '1');
      const pageSize = 12;
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const countResult = await db.select({ count: sql`count(*)` }).from(events);
      const totalCount = Number(countResult[0].count);
      
      // Get today's date for sorting
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of today
      
      // Using a CASE expression to prioritize upcoming events, then null dates, then past events
      const allEvents = await db.select().from(events)
        .orderBy(
          sql`CASE 
            WHEN ${events.eventDatebeg} >= ${today.toISOString()} THEN 1
            WHEN ${events.eventDatebeg} IS NULL THEN 2
            ELSE 3
          END, ${events.eventDatebeg} ASC`
        )
        .limit(pageSize)
        .offset(offset);
      
      // Get total pages
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Render the events page
      const eventsPageHtml = renderToString(
        <EventsPageWrapper 
          events={allEvents} 
          initialPage={page}
          initialPageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          user={user}
          isAuthenticated={isAuthenticated}
        />
      );
      
      return HtmlPage({
        title: 'Events | Nouasseur Alumni Association',
        content: eventsPageHtml
      });
    } catch (error) {
      console.error('Error rendering events page:', error);
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      return ErrorPage({ 
        title: 'Error', 
        message: 'Error Loading Events', 
        error: error.message 
      });
    }
  })
  
  // Members page route - protected
  .get('/members', async ({ set, query, isAuthenticated, user }) => {
    try {
      // Set content type header to ensure browser renders as HTML
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      
      const page = parseInt(query?.page || '1');
      const pageSize = 20;
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const countResult = await db.select({ count: sql`count(*)` }).from(members);
      const totalCount = Number(countResult[0].count);
      
      // Get members with pagination
      const allMembers = await db.select().from(members)
        .orderBy(members.lastName, members.firstName)
        .limit(pageSize)
        .offset(offset);
      
      // Get total pages
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Render the members page
      const membersPageHtml = renderToString(
        <Layout user={user} isAuthenticated={isAuthenticated}>
          <MembersPage 
            members={allMembers}
            initialPage={page}
            initialPageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
          />
        </Layout>
      );
      
      return HtmlPage({
        title: 'Members | Nouasseur Alumni Association',
        content: membersPageHtml
      });
    } catch (error) {
      console.error('Error rendering members page:', error);
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      return ErrorPage({ 
        title: 'Error', 
        message: 'Error Loading Members', 
        error: error.message 
      });
    }
  })
  
  // Directory page route - protected
  .get('/directory', async ({ set, query, isAuthenticated, user }) => {
    try {
      // Set content type header to ensure browser renders as HTML
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      
      const page = parseInt(query?.page || '1');
      const pageSize = 9;
      const offset = (page - 1) * pageSize;
      
      // Get directories with pagination and categories
      const [directoryData, countResult, categories] = await Promise.all([
        db.select().from(directories)
          .limit(pageSize)
          .offset(offset)
          .orderBy(directories.sortOrder, directories.name),
        db.select({ count: sql<number>`count(*)` }).from(directories),
        db.selectDistinct({ category: directories.category })
          .from(directories)
          .where(sql`${directories.category} is not null`)
      ]);
      
      const totalCount = countResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      const categoryList = categories.map(cat => cat.category).filter(Boolean);
      
      // Render the directory page
      const directoryPageHtml = renderToString(
        <Layout user={user} isAuthenticated={isAuthenticated}>
          <DirectoryPage 
            directories={directoryData} 
            categories={categoryList}
            initialPage={page}
            initialPageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
          />
        </Layout>
      );
      
      return HtmlPage({
        title: 'Directory | Nouasseur Alumni Association',
        content: directoryPageHtml
      });
    } catch (error) {
      console.error('Error rendering directory page:', error);
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      return ErrorPage({ 
        title: 'Error', 
        message: 'Failed to load directory', 
        error: error.message 
      });
    }
  });

// Start the server
protectedApp.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});