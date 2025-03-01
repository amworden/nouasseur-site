import { Elysia, t } from 'elysia';
import { db } from '../db';
import { events, type NewEvent } from '../db/schema';
import { eq } from 'drizzle-orm';

export const eventsApi = new Elysia({ prefix: '/api/events' })
  // Get all events
  .get('/', async () => {
    try {
      // Sort by sort code first, then by name
      const allEvents = await db.select().from(events)
        .orderBy(events.eventSortcode, events.eventName);
      return { success: true, data: allEvents };
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
      const newEvent = await db.insert(events).values(body).returning();
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
      const updatedEvent = await db.update(events)
        .set({
          ...body,
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