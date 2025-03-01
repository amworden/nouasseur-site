import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { Layout } from './components/Layout';
import { EventsPage } from './components/EventsPage';
import { MembersPage } from './components/MembersPage';
import { db } from './db';
import { events, members } from './db/schema';
import { eventsApi } from './api/events';
import { usersApi } from './api/users';
import { healthApi } from './api/health';
import { membersApi } from './api/members';
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
const HomePage = ({ events }) => (
  <Layout>
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
const EventsPageWrapper = ({ events }) => (
  <Layout>
    <div className="container mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-bold">Upcoming Events</h1>
        <p className="text-xl text-muted-foreground">
          Discover and participate in our exciting community events
        </p>
      </div>
      
      <EventsPage events={events} />
    </div>
  </Layout>
);

// Create the main app
const app = new Elysia()
  .use(cors())
  .use(staticPlugin({
    assets: 'public', 
    prefix: ''
  }))
  .use(eventsApi)
  .use(usersApi)
  .use(healthApi)
  .use(membersApi)
  
  // Home page route
  .get('/', async ({ set }) => {
    try {
      // Set content type header to ensure browser renders as HTML
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      
      // First get upcoming events (where start date is today or later)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of today
      
      const allEvents = await db.select().from(events)
        .where(sql`(${events.eventDatebeg} >= ${today.toISOString()} OR ${events.eventDatebeg} IS NULL)`)
        .orderBy(sql`COALESCE(${events.eventDatebeg}, '9999-12-31')`, events.eventName)
        .limit(8);
      
      const pageContent = renderToString(<HomePage events={allEvents} />);
      return HtmlPage({ 
        title: 'Nouasseur Events', 
        content: pageContent 
      });
    } catch (error) {
      console.error('Error rendering home page:', error);
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      return ErrorPage({ 
        title: 'Error', 
        message: 'Something went wrong', 
        error: error.message 
      });
    }
  })
  
  // Events page route
  .get('/events', async ({ set }) => {
    try {
      // Set content type header to ensure browser renders as HTML
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      
      // Get all events but order upcoming first, then past events
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of today
      
      // Using a CASE expression to prioritize upcoming events, then null dates, then past events
      const allEvents = await db.select().from(events)
        .orderBy(
          sql`CASE 
            WHEN ${events.eventDatebeg} >= ${today.toISOString()} THEN 0 
            WHEN ${events.eventDatebeg} IS NULL THEN 1 
            ELSE 2 
          END, COALESCE(${events.eventDatebeg}, '9999-12-31')`, 
          events.eventName
        );
      
      const pageContent = renderToString(<EventsPageWrapper events={allEvents} />);
      return HtmlPage({ 
        title: 'Events | Nouasseur Events', 
        content: pageContent 
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
  
  // Members page route
  .get('/members', async ({ set }) => {
    try {
      // Set content type header to ensure browser renders as HTML
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      
      const page = 1;
      const pageSize = 20;
      
      // Get total count for pagination
      const countResult = await db.select({ count: sql`count(*)` }).from(members);
      const totalCount = Number(countResult[0].count);
      
      // Get initial members for first page
      const allMembers = await db.select().from(members)
        .orderBy(members.lastName, members.firstName)
        .limit(pageSize)
        .offset(0);
      
      const pageContent = renderToString(
        <Layout>
          <MembersPage 
            members={allMembers} 
            initialPage={page}
            initialPageSize={pageSize}
            totalCount={totalCount}
            totalPages={Math.ceil(totalCount / pageSize)}
          />
        </Layout>
      );
      
      return HtmlPage({ 
        title: 'Members Directory | Nouasseur Events', 
        content: pageContent 
      });
    } catch (error) {
      console.error("Error rendering members page:", error);
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      return ErrorPage({ 
        title: 'Error', 
        message: 'Error Loading Members', 
        error: error.message 
      });
    }
  })
  
  // Start the server
  .listen(3000);

console.log(`🦊 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`);