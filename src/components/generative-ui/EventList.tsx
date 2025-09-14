import { EventCard } from "./EventCard";
import type { CalendarEvent } from "@/tools/calendar/types";

interface EventListProps {
  events: CalendarEvent[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  maxItems?: number;
  groupByDate?: boolean;
}

export function EventList({
  events,
  title,
  subtitle,
  compact = false,
  onEdit,
  onDelete,
  maxItems,
  groupByDate = false
}: EventListProps) {
  const displayEvents = maxItems ? events.slice(0, maxItems) : events;
  const hasMore = maxItems && events.length > maxItems;

  if (events.length === 0) {
    return null; // Don't show anything if no events
  }

  const groupEventsByDate = (events: CalendarEvent[]) => {
    if (!groupByDate) return { "All Events": events };

    const grouped: Record<string, CalendarEvent[]> = {};

    events.forEach((event) => {
      const eventDate = event.start.dateTime || event.start.date;
      if (!eventDate) return;

      const date = new Date(eventDate);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = "Today";
      } else if (date.toDateString() === tomorrow.toDateString()) {
        dateKey = "Tomorrow";
      } else {
        dateKey = date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric"
        });
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  };

  const groupedEvents = groupEventsByDate(displayEvents);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([dateKey, dateEvents]) => (
        <div key={dateKey}>
          {groupByDate && Object.keys(groupedEvents).length > 1 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-3">
                {dateKey}
              </h3>
            </div>
          )}

          <div className={`space-y-${compact ? "2" : "4"}`}>
            {dateEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                compact={compact}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="text-center py-4">
          <p className="text-sm text-neutral-500">
            Showing {maxItems} of {events.length} events
          </p>
        </div>
      )}
    </div>
  );
}
