import { tool } from "ai";
import { z } from "zod";
import { getCurrentAgent } from "agents";
import type { Chat } from "@/server";
import { formatEventSummary } from "./helpers";
import type { CalendarEvent } from "./types";

export const getUpcomingEvents = tool({
  description: "Get upcoming calendar events from the user's primary calendar",
  parameters: z.object({
    maxResults: z
      .number()
      .min(1)
      .max(50)
      .default(10)
      .describe("Maximum number of events to retrieve (1-50)"),
    days: z
      .number()
      .min(1)
      .max(365)
      .default(7)
      .describe("Number of days to look ahead (1-365)")
  }),
  execute: async ({ maxResults, days }) => {
    try {
      const { agent } = getCurrentAgent<Chat>();
      const now = new Date();
      const timeMin = now.toISOString();
      const timeMax = new Date(
        now.getTime() + days * 24 * 60 * 60 * 1000
      ).toISOString();

      const data = (await agent!.makeCalendarApiRequest(
        `/calendars/primary/events?timeMin=${encodeURIComponent(
          timeMin
        )}&timeMax=${encodeURIComponent(
          timeMax
        )}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`
      )) as any;

      const events: CalendarEvent[] = data.items || [];

      if (events.length === 0) {
        return `📅 No upcoming events found in the next ${days} days.`;
      }

      const eventSummaries = events
        .map((event, index) => `${index + 1}. ${formatEventSummary(event)}`)
        .join("\n\n");

      return `📅 **Upcoming Events (Next ${days} days):**\n\n${eventSummaries}`;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return `❌ Failed to get upcoming events: ${errorMessage}`;
    }
  }
});

export const getTodayEvents = tool({
  description: "Get today's calendar events",
  parameters: z.object({}),
  execute: async ({}) => {
    try {
      const { agent } = getCurrentAgent<Chat>();
      const today = new Date();
      const timeMin = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).toISOString();
      const timeMax = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      ).toISOString();

      const data = (await agent!.makeCalendarApiRequest(
        `/calendars/primary/events?timeMin=${encodeURIComponent(
          timeMin
        )}&timeMax=${encodeURIComponent(
          timeMax
        )}&singleEvents=true&orderBy=startTime`
      )) as any;

      const events: CalendarEvent[] = data.items || [];

      if (events.length === 0) {
        return `📅 No events scheduled for today.`;
      }

      const eventSummaries = events
        .map((event, index) => `${index + 1}. ${formatEventSummary(event)}`)
        .join("\n\n");

      return `📅 **Today's Events:**\n\n${eventSummaries}`;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return `❌ Failed to get today's events: ${errorMessage}`;
    }
  }
});

export const getEventDetails = tool({
  description: "Get detailed information about a specific calendar event",
  parameters: z.object({
    eventId: z.string().describe("The ID of the event to get details for")
  }),
  execute: async ({ eventId }) => {
    try {
      const { agent } = getCurrentAgent<Chat>();
      const event: CalendarEvent = (await agent!.makeCalendarApiRequest(
        `/calendars/primary/events/${eventId}`
      )) as CalendarEvent;

      const startTime = event.start.dateTime
        ? new Date(event.start.dateTime).toLocaleString()
        : event.start.date
          ? new Date(event.start.date).toLocaleDateString()
          : "Unknown";

      const endTime = event.end.dateTime
        ? new Date(event.end.dateTime).toLocaleString()
        : event.end.date
          ? new Date(event.end.date).toLocaleDateString()
          : "Unknown";

      let details = `📅 **Event Details:**\n\n`;
      details += `**Title:** ${event.summary}\n`;
      details += `**Start:** ${startTime}\n`;
      details += `**End:** ${endTime}\n`;

      if (event.description) {
        details += `**Description:** ${event.description}\n`;
      }

      if (event.location) {
        details += `**Location:** ${event.location}\n`;
      }

      if (event.attendees && event.attendees.length > 0) {
        details += `**Attendees:**\n`;
        event.attendees.forEach((attendee) => {
          const status = attendee.responseStatus || "needsAction";
          const statusEmoji =
            {
              accepted: "✅",
              declined: "❌",
              tentative: "❓",
              needsAction: "⏳"
            }[status] || "⏳";
          details += `  ${statusEmoji} ${attendee.email}${
            attendee.displayName ? ` (${attendee.displayName})` : ""
          }\n`;
        });
      }

      if (event.htmlLink) {
        details += `\n🔗 [View in Google Calendar](${event.htmlLink})`;
      }

      return details;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return `❌ Failed to get event details: ${errorMessage}`;
    }
  }
});

export const searchEvents = tool({
  description: "Search for calendar events by text query",
  parameters: z.object({
    query: z
      .string()
      .describe(
        "Search query to find events (searches in title, description, location)"
      ),
    maxResults: z
      .number()
      .min(1)
      .max(50)
      .default(10)
      .describe("Maximum number of events to return"),
    days: z
      .number()
      .min(1)
      .max(365)
      .default(30)
      .describe("Number of days to search within")
  }),
  execute: async ({ query, maxResults, days }) => {
    try {
      const { agent } = getCurrentAgent<Chat>();
      const now = new Date();
      const timeMin = now.toISOString();
      const timeMax = new Date(
        now.getTime() + days * 24 * 60 * 60 * 1000
      ).toISOString();

      const data = (await agent!.makeCalendarApiRequest(
        `/calendars/primary/events?q=${encodeURIComponent(
          query
        )}&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(
          timeMax
        )}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`
      )) as any;

      const events: CalendarEvent[] = data.items || [];

      if (events.length === 0) {
        return `📅 No events found matching "${query}" in the next ${days} days.`;
      }

      const eventSummaries = events
        .map((event, index) => `${index + 1}. ${formatEventSummary(event)}`)
        .join("\n\n");

      return `📅 **Search Results for "${query}":**\n\n${eventSummaries}`;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return `❌ Failed to search events: ${errorMessage}`;
    }
  }
});
