import * as React from "react";
import { format } from "date-fns";
import type { Event } from "../db/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return "TBD";
    // If it's a string, convert to Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, "MMMM dd, yyyy");
  };

  // Simple function to strip all HTML tags completely
  const stripHtml = (html: string | null) => {
    if (!html) return "";
    return html
      .replace(/<\/?[^>]+(>|$)/g, " ") // Remove all HTML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim();
  };

  // Simple function to test if URL is likely a valid image and not an HTML page
  const isLikelyImage = (url: string | null | undefined) => {
    if (!url) return false;
    if (url.endsWith('.htm') || url.endsWith('.html')) return false;
    return true;
  };
  
  // Create a unique ID for this event's modal
  const modalId = `event-modal-${event.id}`;

  return (
    <>
      <Card className="flex flex-col h-full">
        {event.eventPhoto1 && isLikelyImage(event.eventPhoto1) && (
          <div className="h-48 overflow-hidden bg-secondary/20">
            <img
              src={event.eventPhoto1}
              alt={event.eventName}
              className="h-full w-full object-cover"
              onError={(e) => {
                // If image fails to load, replace with a placeholder
                e.currentTarget.src = 'https://placehold.co/600x400/9CA3AF/FFFFFF?text=Event+Image';
              }}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="line-clamp-2">{event.eventName}</CardTitle>
          {event.eventSubtitle && (
            <CardDescription className="line-clamp-2">{stripHtml(event.eventSubtitle)}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-grow space-y-2">
          {event.eventLoc && (
            <div className="flex items-start text-sm">
              <span className="mr-2">📍</span>
              <span>{stripHtml(event.eventLoc)}</span>
            </div>
          )}
          <div className="flex items-start text-sm">
            <span className="mr-2">📅</span>
            <span>
              {event.eventDatebeg && formatDate(event.eventDatebeg)}
              {event.eventDateend && event.eventDateend !== event.eventDatebeg && (
                <> - {formatDate(event.eventDateend)}</>
              )}
            </span>
          </div>
          {event.eventTime && (
            <div className="flex items-start text-sm">
              <span className="mr-2">⏰</span>
              <span>{stripHtml(event.eventTime)}</span>
            </div>
          )}
          {event.eventDesc && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {stripHtml(event.eventDesc)}
            </p>
          )}
        </CardContent>
        <CardFooter className="pt-0 pb-4">
          <Button 
            variant="default" 
            className="w-full text-primary-foreground"
            onClick={(e) => {
              e.preventDefault();
              // Let the modal.js handle the toggling via data-modal-toggle
              // No need for custom implementation here
            }}
            data-modal-toggle={modalId}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
      
      {/* Event Details Modal */}
      <div 
        id={modalId}
        className="modal-container fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${event.id}`}
      >
        <div 
          id={`overlay-${modalId}`}
          className="absolute inset-0"
        ></div>
        <div className="modal-dialog relative w-full max-w-3xl rounded-lg border border-border bg-card p-6 shadow-lg">
          <button
            id={`close-${modalId}`}
            className="modal-close absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary"
            aria-label="Close"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          {/* Loading spinner */}
          <div id={`loading-${modalId}`} className="flex items-center justify-center py-10">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
          
          {/* Modal content - hidden until loaded */}
          <div id={`content-${modalId}`} className="hidden">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Left column with image */}
              <div className="flex flex-col items-center">
                {event.eventPhoto1 && isLikelyImage(event.eventPhoto1) ? (
                  <div className="mb-4 overflow-hidden rounded-lg border border-border">
                    <img
                      src={event.eventPhoto1}
                      alt={event.eventName}
                      className="h-auto w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/600x400/9CA3AF/FFFFFF?text=Event+Image';
                      }}
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex h-40 w-full items-center justify-center rounded-lg bg-secondary/30">
                    <span className="text-4xl">🎉</span>
                  </div>
                )}
                
                <h2 id={`modal-title-${event.id}`} className="text-center text-2xl font-bold">
                  {event.eventName}
                </h2>
                {event.eventSubtitle && (
                  <p className="text-center text-muted-foreground">{stripHtml(event.eventSubtitle)}</p>
                )}
              </div>
              
              {/* Right column with details */}
              <div className="col-span-2 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Event Details</h3>
                  <div className="mt-2 space-y-2">
                    {event.eventLoc && (
                      <p>
                        <span className="font-medium">Location:</span> {stripHtml(event.eventLoc)}
                      </p>
                    )}
                    
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {event.eventDatebeg && formatDate(event.eventDatebeg)}
                      {event.eventDateend && event.eventDateend !== event.eventDatebeg && (
                        <> - {formatDate(event.eventDateend)}</>
                      )}
                    </p>
                    
                    {event.eventTime && (
                      <p>
                        <span className="font-medium">Time:</span> {stripHtml(event.eventTime)}
                      </p>
                    )}
                  </div>
                </div>
                
                {event.eventDesc && (
                  <div>
                    <h3 className="text-lg font-semibold">Description</h3>
                    <p className="mt-2 whitespace-pre-wrap">{stripHtml(event.eventDesc)}</p>
                  </div>
                )}
                
                {/* Additional images if available */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {event.eventPhoto2 && isLikelyImage(event.eventPhoto2) && (
                    <div className="overflow-hidden rounded-lg border border-border">
                      <img
                        src={event.eventPhoto2}
                        alt={`${event.eventName} - additional image 1`}
                        className="h-24 w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.classList.add('hidden');
                        }}
                      />
                    </div>
                  )}
                  {event.eventPhoto3 && isLikelyImage(event.eventPhoto3) && (
                    <div className="overflow-hidden rounded-lg border border-border">
                      <img
                        src={event.eventPhoto3}
                        alt={`${event.eventName} - additional image 2`}
                        className="h-24 w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.classList.add('hidden');
                        }}
                      />
                    </div>
                  )}
                  {event.eventPhoto4 && isLikelyImage(event.eventPhoto4) && (
                    <div className="overflow-hidden rounded-lg border border-border">
                      <img
                        src={event.eventPhoto4}
                        alt={`${event.eventName} - additional image 3`}
                        className="h-24 w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.classList.add('hidden');
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}