// Calendar types for Google Calendar API integration

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  }>;
  location?: string;
  status?: "confirmed" | "tentative" | "cancelled";
  created?: string;
  updated?: string;
  htmlLink?: string;
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
}

// Additional interfaces can be added here as needed

export interface Calendar {
  id: string;
  summary: string;
  description?: string;
  timeZone?: string;
  primary?: boolean;
}
