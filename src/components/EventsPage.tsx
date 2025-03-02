import * as React from "react";
import { useState, useEffect } from "react";
import type { Event } from "../db/schema";
import { EventCard } from "./EventCard";

interface EventsPageProps {
  events?: Event[];
  initialPage?: number;
  initialPageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export function EventsPage({
  events = [],
  initialPage = 1,
  initialPageSize = 12,
  totalCount = 0,
  totalPages = 1,
}: EventsPageProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [eventsData, setEventsData] = useState<Event[]>(events);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(totalPages);
  const [pageSize] = useState(initialPageSize);
  
  // Fetch events when page changes
  useEffect(() => {
    if (events.length === 0 || currentPage !== initialPage) {
      fetchEvents(currentPage);
    }
  }, [currentPage]);
  
  const fetchEvents = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events?page=${page}&pageSize=${pageSize}`);
      const data = await response.json();
      
      if (data.success) {
        setEventsData(data.data);
        setPageCount(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {eventsData.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed">
              <h3 className="mb-2 text-2xl font-semibold">No events found</h3>
              <p className="text-muted-foreground">Check back soon for upcoming events!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {eventsData.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                />
              ))}
            </div>
          )}
          
          {pageCount > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center rounded-l-md border border-border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pageCount) }).map((_, i) => {
                  // Show pages around current page
                  let pageNum = currentPage;
                  if (pageCount <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pageCount - 2) {
                    pageNum = pageCount - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`inline-flex items-center border border-border px-4 py-2 text-sm font-medium ${
                        currentPage === pageNum
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/70 text-primary-foreground hover:bg-primary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, pageCount))}
                  disabled={currentPage === pageCount}
                  className="inline-flex items-center rounded-r-md border border-border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}