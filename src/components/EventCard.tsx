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

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
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
      <CardContent className="space-y-2">
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
      <CardFooter>
        <Button variant="secondary" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}