import { Elysia, t } from 'elysia';
import { db } from '../db';
import { events, type NewEvent } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export const eventsApi = new Elysia({ prefix: '/api/events' })
  // Get all events (paginated)
  .get('/', async ({ query }) => {
    try {
      const page = parseInt(query?.page || '1');
      const pageSize = parseInt(query?.pageSize || '12');
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination info
      const countResult = await db.select({ count: sql`count(*)` }).from(events);
      const totalCount = Number(countResult[0].count);
      
      // Get today's date for sorting
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of today
      
      // Get paginated events using the case logic for ordering
      const allEvents = await db.select().from(events)
        .orderBy(
          sql`CASE 
            WHEN ${events.eventDatebeg} >= ${today.toISOString()} THEN 0 
            WHEN ${events.eventDatebeg} IS NULL THEN 1 
            ELSE 2 
          END, COALESCE(${events.eventDatebeg}, '9999-12-31')`, 
          events.eventName
        )
        .limit(pageSize)
        .offset(offset);
      
      return { 
        success: true, 
        data: allEvents,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      return { success: false, error: 'Failed to fetch events' };
    }
  })
  
  // Get event by id
  .get('/:id', async ({ params }) => {
    try {
      const event = await db.select().from(events)
        .where(eq(events.id, parseInt(params.id)))
        .limit(1);
        
      if (event.length === 0) {
        return { success: false, error: 'Event not found' };
      }
      
      return { success: true, data: event[0] };
    } catch (error) {
      console.error(`Error fetching event with ID ${params.id}:`, error);
      return { success: false, error: 'Failed to fetch event' };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  
  // Create a new event
  .post('/', async ({ body }) => {
    try {
      const eventData = body as NewEvent;
      const newEvent = await db.insert(events).values(eventData).returning();
      return { success: true, data: newEvent[0] };
    } catch (error) {
      console.error('Error creating event:', error);
      return { success: false, error: 'Failed to create event' };
    }
  }, {
    body: t.Object({
      eventName: t.String(),
      eventSubtitle: t.Optional(t.String()),
      eventLoc: t.Optional(t.String()),
      eventDatebeg: t.Optional(t.String()),
      eventDateend: t.Optional(t.String()),
      eventTime: t.Optional(t.String()),
      eventDesc: t.Optional(t.String()),
      eventPhoto1: t.Optional(t.String()),
      eventPhoto2: t.Optional(t.String()),
      eventPhoto3: t.Optional(t.String()),
      eventPhoto4: t.Optional(t.String()),
      eventStatus: t.Optional(t.String()),
      eventModuser: t.Optional(t.String()),
      eventSortcode: t.Optional(t.Number())
    })
  })
  
  // Update an event
  .put('/:id', async ({ params, body }) => {
    try {
      const updateData = body as Partial<NewEvent>;
      const updatedEvent = await db.update(events)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(events.id, parseInt(params.id)))
        .returning();
        
      if (updatedEvent.length === 0) {
        return { success: false, error: 'Event not found' };
      }
      
      return { success: true, data: updatedEvent[0] };
    } catch (error) {
      console.error(`Error updating event with ID ${params.id}:`, error);
      return { success: false, error: 'Failed to update event' };
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      eventName: t.Optional(t.String()),
      eventSubtitle: t.Optional(t.String()),
      eventLoc: t.Optional(t.String()),
      eventDatebeg: t.Optional(t.String()),
      eventDateend: t.Optional(t.String()),
      eventTime: t.Optional(t.String()),
      eventDesc: t.Optional(t.String()),
      eventPhoto1: t.Optional(t.String()),
      eventPhoto2: t.Optional(t.String()),
      eventPhoto3: t.Optional(t.String()),
      eventPhoto4: t.Optional(t.String()),
      eventStatus: t.Optional(t.String()),
      eventModuser: t.Optional(t.String()),
      eventSortcode: t.Optional(t.Number())
    })
  })
  
  // Delete an event
  .delete('/:id', async ({ params }) => {
    try {
      const deletedEvent = await db.delete(events)
        .where(eq(events.id, parseInt(params.id)))
        .returning();
        
      if (deletedEvent.length === 0) {
        return { success: false, error: 'Event not found' };
      }
      
      return { success: true, data: deletedEvent[0] };
    } catch (error) {
      console.error(`Error deleting event with ID ${params.id}:`, error);
      return { success: false, error: 'Failed to delete event' };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  }); 