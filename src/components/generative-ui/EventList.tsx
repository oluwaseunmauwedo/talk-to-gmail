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
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          No events found
        </h3>
        <p className="text-sm text-neutral-500">
          {title
            ? `No events match your criteria.`
            : `No upcoming events scheduled.`}
        </p>
      </div>
    );
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
      {(title || subtitle) && (
        <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
          {title && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📅</span>
              <h2 className="text-xl font-semibold">{title}</h2>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                {events.length}
              </span>
            </div>
          )}
          {subtitle && (
            <p className="text-neutral-600 dark:text-neutral-400">{subtitle}</p>
          )}
        </div>
      )}

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
