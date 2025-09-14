import { tool } from "ai";
import { z } from "zod";
import { getCurrentAgent } from "agents";
import type { Chat } from "@/server";
import type { CalendarEvent } from "./types";

// These tools return structured data for generative UI instead of markdown strings

export const getUpcomingEventsUI = tool({
  description:
    "Get upcoming calendar events with structured data for UI rendering",
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

      return {
        type: "events",
        events,
        title: "Upcoming Events",
        subtitle: `Next ${days} days`,
        groupByDate: true,
        count: events.length
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        type: "error",
        message: `Failed to get upcoming events: ${errorMessage}`
      };
    }
  }
});

export const getTodayEventsUI = tool({
  description:
    "Get today's calendar events with structured data for UI rendering",
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

      return {
        type: "events",
        events,
        title: "Today's Events",
        subtitle: today.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        count: events.length
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        type: "error",
        message: `Failed to get today's events: ${errorMessage}`
      };
    }
  }
});

export const getEventDetailsUI = tool({
  description:
    "Get detailed information about a specific calendar event with structured data for UI rendering",
  parameters: z.object({
    eventId: z.string().describe("The ID of the event to get details for")
  }),
  execute: async ({ eventId }) => {
    try {
      const { agent } = getCurrentAgent<Chat>();
      const event: CalendarEvent = (await agent!.makeCalendarApiRequest(
        `/calendars/primary/events/${eventId}`
      )) as CalendarEvent;

      return {
        type: "event_detail",
        event,
        title: "Event Details"
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        type: "error",
        message: `Failed to get event details: ${errorMessage}`
      };
    }
  }
});

export const searchEventsUI = tool({
  description:
    "Search for calendar events with structured data for UI rendering",
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

      return {
        type: "events",
        events,
        title: "Search Results",
        subtitle: `Found ${events.length} events matching "${query}"`,
        query,
        groupByDate: true,
        count: events.length
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        type: "error",
        message: `Failed to search events: ${errorMessage}`
      };
    }
  }
});
