import { Card } from "@/components/card/Card";
import { Button } from "@/components/button/Button";
import type { CalendarEvent } from "@/tools/calendar/types";

interface EventCardProps {
  event: CalendarEvent;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  compact?: boolean;
}

export function EventCard({
  event,
  onEdit,
  onDelete,
  compact = false
}: EventCardProps) {
  const formatDateTime = (
    dateTime?: string,
    date?: string,
    timeZone?: string
  ) => {
    if (dateTime) {
      const eventDate = new Date(dateTime);
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timeZone || undefined
      };
      return eventDate.toLocaleString("en-US", options);
    } else if (date) {
      const eventDate = new Date(date);
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "long",
        day: "numeric"
      };
      return eventDate.toLocaleDateString("en-US", options);
    }
    return "Unknown time";
  };

  const formatTimeRange = () => {
    const startTime = formatDateTime(
      event.start.dateTime,
      event.start.date,
      event.start.timeZone
    );

    if (event.start.date && event.end.date) {
      // All-day event
      const startDate = new Date(event.start.date);
      const endDate = new Date(event.end.date);
      const diffDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        return `All day • ${startTime}`;
      } else {
        const endFormatted = formatDateTime(undefined, event.end.date);
        return `All day • ${startTime} - ${endFormatted}`;
      }
    } else if (event.start.dateTime && event.end.dateTime) {
      // Timed event
      const endTime = new Date(event.end.dateTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      return `${startTime} - ${endTime}`;
    }

    return startTime;
  };

  const getStatusColor = () => {
    switch (event.status) {
      case "confirmed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "tentative":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      default:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
    }
  };

  const getEventIcon = () => {
    if (event.attendees && event.attendees.length > 1) return "👥";
    if (event.location) return "📍";
    return "📅";
  };

  if (compact) {
    return (
      <Card className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">{getEventIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">
                {event.summary}
              </h3>
              {event.status && event.status !== "confirmed" && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor()}`}
                >
                  {event.status}
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              {formatTimeRange()}
            </p>
            {event.location && (
              <p className="text-xs text-neutral-500 truncate">
                📍 {event.location}
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0">{getEventIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{event.summary}</h3>
                {event.status && event.status !== "confirmed" && (
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${getStatusColor()}`}
                  >
                    {event.status}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 mb-2">
                <span className="text-lg">🕒</span>
                <span className="font-medium">{formatTimeRange()}</span>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {onEdit && (
                <Button
                  onClick={() => onEdit(event.id)}
                  className="px-3 py-1 text-sm"
                  variant="secondary"
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={() => onDelete(event.id)}
                  className="px-3 py-1 text-sm"
                  variant="destructive"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 mb-3">
              <span className="text-lg">📍</span>
              <span>{event.location}</span>
            </div>
          )}

          {event.description && (
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 mb-3">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <span className="text-lg">👥</span>
                Attendees ({event.attendees.length})
              </h4>
              <div className="space-y-1">
                {event.attendees.slice(0, 5).map((attendee) => {
                  const statusEmoji = {
                    accepted: "✅",
                    declined: "❌",
                    tentative: "❓",
                    needsAction: "⏳"
                  }[attendee.responseStatus || "needsAction"];

                  return (
                    <div
                      key={attendee.email}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span>{statusEmoji}</span>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {attendee.displayName || attendee.email}
                      </span>
                      {attendee.displayName && (
                        <span className="text-neutral-500 text-xs">
                          ({attendee.email})
                        </span>
                      )}
                    </div>
                  );
                })}
                {event.attendees.length > 5 && (
                  <div className="text-sm text-neutral-500">
                    +{event.attendees.length - 5} more attendees
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <span className="text-xs text-neutral-500 font-mono">
              ID: {event.id}
            </span>
            {event.htmlLink && (
              <a
                href={event.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View in Google Calendar →
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
