import { tool } from "ai";
import { z } from "zod";
import { getCurrentAgent } from "agents";
import type { Chat } from "@/server";
import { parseDateTime, addHoursToDateTime } from "./helpers";
import type { CalendarEvent } from "./types";

export const createEvent = tool({
  description: "Create a new calendar event",
  parameters: z.object({
    summary: z.string().describe("Event title/summary"),
    description: z.string().optional().describe("Event description"),
    startDateTime: z
      .string()
      .describe(
        "Start date and time (e.g., '2025-09-15T10:00:00', 'Monday 15th Sep 2025 10:00 AM')"
      ),
    endDateTime: z
      .string()
      .optional()
      .describe(
        "End date and time (if not provided, defaults to 1 hour after start)"
      ),
    attendees: z
      .array(z.string())
      .optional()
      .describe("Array of attendee email addresses"),
    location: z.string().optional().describe("Event location"),
    timeZone: z
      .string()
      .default("UTC")
      .describe("Timezone for the event (e.g., 'America/New_York')")
  }),
  execute: async ({
    summary,
    description,
    startDateTime,
    endDateTime,
    attendees,
    location,
    timeZone
  }) => {
    try {
      const { agent } = getCurrentAgent<Chat>();

      // Parse and validate start time
      const startISO = parseDateTime(startDateTime, timeZone);
      const endISO = endDateTime
        ? parseDateTime(endDateTime, timeZone)
        : addHoursToDateTime(startISO, 1);

      // Prepare event data
      const eventData: any = {
        summary,
        start: {
          dateTime: startISO,
          timeZone
        },
        end: {
          dateTime: endISO,
          timeZone
        }
      };

      if (description) {
        eventData.description = description;
      }

      if (location) {
        eventData.location = location;
      }

      if (attendees && attendees.length > 0) {
        eventData.attendees = attendees.map((email) => ({ email }));
      }

      // Create the event
      const createdEvent: CalendarEvent = (await agent!.makeCalendarApiRequest(
        "/calendars/primary/events",
        {
          method: "POST",
          body: JSON.stringify(eventData)
        }
      )) as CalendarEvent;

      let result = `✅ **Event Created Successfully!**\n\n`;
      result += `📅 **${createdEvent.summary}**\n`;
      result += `🕒 ${new Date(startISO).toLocaleString()} - ${new Date(
        endISO
      ).toLocaleString()}\n`;

      if (location) {
        result += `📍 ${location}\n`;
      }

      if (attendees && attendees.length > 0) {
        result += `👥 Attendees: ${attendees.join(", ")}\n`;
      }

      if (createdEvent.htmlLink) {
        result += `\n🔗 [View in Google Calendar](${createdEvent.htmlLink})`;
      }

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return `❌ Failed to create event: ${errorMessage}`;
    }
  }
});

export const scheduleQuickMeeting = tool({
  description: "Quickly schedule a meeting with someone",
  parameters: z.object({
    attendeeEmail: z
      .string()
      .describe("Email address of the person to meet with"),
    date: z
      .string()
      .describe(
        "Date for the meeting (e.g., 'Monday 15th Sep 2025', '2025-09-15')"
      ),
    time: z
      .string()
      .optional()
      .describe(
        "Time for the meeting (e.g., '10:00 AM', '14:30'). Defaults to 10:00 AM if not specified"
      ),
    duration: z
      .number()
      .default(60)
      .describe("Meeting duration in minutes (default: 60)"),
    subject: z.string().optional().describe("Meeting subject/title"),
    location: z
      .string()
      .optional()
      .describe("Meeting location (can be a physical location or video link)")
  }),
  execute: async ({
    attendeeEmail,
    date,
    time = "10:00 AM",
    duration,
    subject,
    location
  }) => {
    try {
      const { agent } = getCurrentAgent<Chat>();

      // Parse the date and time
      const dateTimeString = `${date} ${time}`;
      const startISO = parseDateTime(dateTimeString);
      const endISO = addHoursToDateTime(startISO, duration / 60);

      // Generate meeting subject if not provided
      const meetingSubject =
        subject || `Meeting with ${attendeeEmail.split("@")[0]}`;

      // Create the meeting
      const eventData: any = {
        summary: meetingSubject,
        start: {
          dateTime: startISO,
          timeZone: "UTC"
        },
        end: {
          dateTime: endISO,
          timeZone: "UTC"
        },
        attendees: [{ email: attendeeEmail }]
      };

      if (location) {
        eventData.location = location;
      }

      const createdEvent: CalendarEvent = (await agent!.makeCalendarApiRequest(
        "/calendars/primary/events",
        {
          method: "POST",
          body: JSON.stringify(eventData)
        }
      )) as CalendarEvent;

      let result = `✅ **Meeting Scheduled Successfully!**\n\n`;
      result += `📅 **${createdEvent.summary}**\n`;
      result += `🕒 ${new Date(startISO).toLocaleString()} (${duration} minutes)\n`;
      result += `👥 With: ${attendeeEmail}\n`;

      if (location) {
        result += `📍 ${location}\n`;
      }

      if (createdEvent.htmlLink) {
        result += `\n🔗 [View in Google Calendar](${createdEvent.htmlLink})`;
      }

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return `❌ Failed to schedule meeting: ${errorMessage}`;
    }
  }
});

export const updateEvent = tool({
  description: "Update an existing calendar event",
  parameters: z.object({
    eventId: z.string().describe("ID of the event to update"),
    summary: z.string().optional().describe("New event title/summary"),
    description: z.string().optional().describe("New event description"),
    startDateTime: z.string().optional().describe("New start date and time"),
    endDateTime: z.string().optional().describe("New end date and time"),
    location: z.string().optional().describe("New event location"),
    addAttendees: z
      .array(z.string())
      .optional()
      .describe("Email addresses to add as attendees"),
    removeAttendees: z
      .array(z.string())
      .optional()
      .describe("Email addresses to remove from attendees")
  }),
  execute: async ({
    eventId,
    summary,
    description,
    startDateTime,
    endDateTime,
    location,
    addAttendees,
    removeAttendees
  }) => {
    try {
      const { agent } = getCurrentAgent<Chat>();

      // First, get the existing event
      const existingEvent: CalendarEvent = (await agent!.makeCalendarApiRequest(
        `/calendars/primary/events/${eventId}`
      )) as CalendarEvent;

      // Prepare update data
      const updateData: any = { ...existingEvent };

      if (summary) updateData.summary = summary;
      if (description !== undefined) updateData.description = description;
      if (location !== undefined) updateData.location = location;

      if (startDateTime) {
        updateData.start = {
          ...updateData.start,
          dateTime: parseDateTime(startDateTime)
        };
      }

      if (endDateTime) {
        updateData.end = {
          ...updateData.end,
          dateTime: parseDateTime(endDateTime)
        };
      }

      // Handle attendee changes
      if (addAttendees || removeAttendees) {
        const currentAttendees = existingEvent.attendees || [];
        let newAttendees = [...currentAttendees];

        if (removeAttendees) {
          newAttendees = newAttendees.filter(
            (attendee) => !removeAttendees.includes(attendee.email)
          );
        }

        if (addAttendees) {
          const existingEmails = newAttendees.map((a) => a.email);
          addAttendees.forEach((email) => {
            if (!existingEmails.includes(email)) {
              newAttendees.push({ email });
            }
          });
        }

        updateData.attendees = newAttendees;
      }

      // Update the event
      const updatedEvent: CalendarEvent = (await agent!.makeCalendarApiRequest(
        `/calendars/primary/events/${eventId}`,
        {
          method: "PUT",
          body: JSON.stringify(updateData)
        }
      )) as CalendarEvent;

      return `✅ **Event Updated Successfully!**\n\n📅 **${
        updatedEvent.summary
      }**\n🕒 ${new Date(
        updatedEvent.start.dateTime || updatedEvent.start.date!
      ).toLocaleString()}`;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return `❌ Failed to update event: ${errorMessage}`;
    }
  }
});

export const deleteEvent = tool({
  description: "Delete a calendar event",
  parameters: z.object({
    eventId: z.string().describe("ID of the event to delete")
  }),
  execute: async ({ eventId }) => {
    try {
      const { agent } = getCurrentAgent<Chat>();

      await agent!.makeCalendarApiRequest(
        `/calendars/primary/events/${eventId}`,
        { method: "DELETE" }
      );

      return `✅ **Event deleted successfully!**`;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return `❌ Failed to delete event: ${errorMessage}`;
    }
  }
});
