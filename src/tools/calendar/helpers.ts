import { CALENDAR_API_BASE } from "@/constants";
import { getValidGmailToken } from "@/services/auth";
import type { Env } from "@/types";
import type { CalendarEvent } from "./types";

export async function makeCalendarApiRequest(
  endpoint: string,
  env: Env,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getValidGmailToken(env);

  const response = await fetch(`${CALENDAR_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Calendar API request failed: ${response.status} ${error}`);
  }

  return response;
}

export function formatDateTime(dateTime: string, timeZone?: string): string {
  const date = new Date(dateTime);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timeZone || "UTC"
  };
  return date.toLocaleString("en-US", options);
}

export function formatDateOnly(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  return date.toLocaleDateString("en-US", options);
}

export function parseDateTime(input: string, _timeZone?: string): string {
  // Handle various date/time formats
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date/time format: ${input}`);
  }

  return date.toISOString();
}

export function addHoursToDateTime(
  dateTime: string,
  hours: number = 1
): string {
  const date = new Date(dateTime);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

export function formatEventSummary(event: CalendarEvent): string {
  const startTime = event.start.dateTime
    ? formatDateTime(event.start.dateTime, event.start.timeZone)
    : event.start.date
      ? formatDateOnly(event.start.date)
      : "Unknown time";

  const location = event.location ? ` at ${event.location}` : "";
  const attendeeCount = event.attendees?.length || 0;
  const attendeeInfo = attendeeCount > 0 ? ` (${attendeeCount} attendees)` : "";

  return `📅 **${event.summary}**
🕒 ${startTime}${location}${attendeeInfo}`;
}

export function isAllDayEvent(event: CalendarEvent): boolean {
  return !!event.start.date && !event.start.dateTime;
}
