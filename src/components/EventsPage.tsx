import * as React from "react";
import type { Event } from "../db/schema";
import { EventCard } from "./EventCard";

interface EventsPageProps {
  events: Event[];
}

export function EventsPage({ events }: EventsPageProps) {
  // For debugging - log the event data structure
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Events data:', events);
    }
  }, [events]);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-bold">Upcoming Events</h1>
        <p className="text-xl text-muted-foreground">
          Discover and participate in our exciting community events
        </p>
      </div>
      {events.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed">
          <h3 className="mb-2 text-2xl font-semibold">No events found</h3>
          <p className="text-muted-foreground">Check back soon for upcoming events!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
            />
          ))}
        </div>
      )}
    </div>
  );
}