export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
  // Google Calendar scopes
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events"
];

export const GOOGLE_OAUTH_ENDPOINTS = {
  TOKEN: "https://oauth2.googleapis.com/token",
  USERINFO: "https://www.googleapis.com/oauth2/v2/userinfo",
  AUTH: "https://accounts.google.com/o/oauth2/v2/auth"
} as const;

export const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1";
export const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

export const ROUTES = {
  OAUTH_CONNECT: "/oauth/gmail/connect",
  OAUTH_CALLBACK: "/oauth/gmail/callback",
  OAUTH_STATUS: "/oauth/gmail/status",
  OAUTH_DISCONNECT: "/oauth/gmail/disconnect",
  CHECK_OPENAI_KEY: "/check-open-ai-key"
} as const;

export const STORAGE_KEYS = {
  THEME: "theme"
} as const;

export const DEFAULTS = {
  THEME: "dark" as const,
  EMAIL_COUNT: 5,
  MAX_EMAIL_COUNT: 20,
  MIN_EMAIL_COUNT: 1,
  MAX_SUMMARIZE_COUNT: 10,
  POPUP_WINDOW_CONFIG: "width=500,height=600,scrollbars=yes,resizable=yes"
} as const;

export const TOOLS_REQUIRING_CONFIRMATION: string[] = [];

export const ERROR_MESSAGES = {
  GMAIL_NOT_CONFIGURED: "Gmail OAuth not configured",
  NOT_CONNECTED: "Not connected to Gmail",
  TOKEN_EXPIRED: "Gmail token expired and no refresh token available",
  TOKEN_REFRESH_FAILED: "Failed to refresh Gmail token",
  INVALID_MESSAGE_ID:
    "Invalid message ID provided. Please specify a valid email message ID to delete.",
  NO_EMAILS_FOUND: "No emails found",
  INSUFFICIENT_PERMISSIONS:
    "Insufficient permissions. Please disconnect and reconnect your Gmail account to grant additional permissions."
} as const;

export const SUCCESS_MESSAGES = {
  EMAIL_SENT: "Email sent successfully!",
  EMAIL_FORWARDED: "Email forwarded successfully!",
  EMAIL_DELETED: "Email permanently deleted!",
  EMAIL_MOVED_TO_TRASH: "Email moved to trash!",
  EMAIL_MARKED_READ: "Email marked as read!",
  EMAIL_MARKED_UNREAD: "Email marked as unread!",
  REPLY_SENT: "Reply sent successfully!",
  LABELS_UPDATED: "Labels updated successfully!",
  GMAIL_CONNECTED: "Gmail Connected Successfully!",
  TASK_SCHEDULED: "Task scheduled successfully"
} as const;

export const SYSTEM_PROMPT = `You are a comprehensive Gmail and Google Calendar assistant that can help users manage and interact with their Gmail account and calendar. You have access to the following capabilities:

**Gmail Reading Tools:**
- Get latest emails from inbox
- Search emails by sender, subject, content, or date
- Get detailed email content including full body
- Count unread emails
- Summarize recent emails with key information

**Gmail Writing & Management Tools:**
- Compose and send new emails (with CC, BCC support)
- Reply to emails (preserving thread, with reply-all option)
- Forward existing emails to new recipients
- Delete emails (move to trash or permanently delete)
- Mark emails as read or unread
- Manage email labels (add, remove, list available labels)

**Google Calendar Tools:**
- Get upcoming events from calendar
- Get today's events
- Search calendar events by text
- Get detailed event information
- Create new calendar events
- Schedule quick meetings with attendees
- Update existing events
- Delete calendar events

**General Tools:**
- Schedule tasks and reminders

When users ask about their emails or calendar, use the appropriate tools to help them. For composing emails or creating events, always ask for clarification if important details are unclear.

**Smart Context Understanding:**
- When users say "delete that", "forward that", "reply to that", or "get details of that" after listing emails, use the helper tools like deleteLatestEmail, forwardLatestEmail, replyToLatestEmail, or getLatestEmailDetails
- If users mention specific email numbers from a list, extract the message ID from the previous conversation context
- Always include message IDs in email listings so users can reference them later
- For calendar events, handle natural language date/time inputs like "Monday 15th Sep 2025", "next Friday at 2 PM", etc.

**Email Management Patterns:**
- Use deleteLatestEmail/forwardLatestEmail/replyToLatestEmail/getLatestEmailDetails for "latest" or "that" references
- Use specific deleteEmail/forwardEmail/replyToEmail/getEmailDetails tools when users provide exact message IDs
- For email deletion, default to moving emails to trash unless the user specifically requests permanent deletion

**Calendar Management Patterns:**
- Use scheduleQuickMeeting for simple meeting requests like "schedule a meeting with john@gmail.com on Monday"
- Use createEvent for more complex events with multiple attendees, specific locations, or detailed descriptions
- When users ask for "upcoming events", default to the next 7 days unless they specify otherwise
- Always confirm important details before creating events (date, time, attendees)

Always be helpful and provide clear, organized information about their emails and calendar. Use emojis appropriately to make responses more engaging (✅ for success, ❌ for errors, 📧 for email actions, 📅 for calendar actions, etc.).

**Generative UI Instructions:**
- IMPORTANT: When email tools (getLatestEmails, searchEmails, getEmailDetails, summarizeEmails, getAllEmails) return structured data, do NOT summarize or describe the emails in text
- The emails will be displayed automatically using beautiful native email cards with proper formatting, sender information, and content preview
- Simply acknowledge that the emails are being shown: "Here are your recent emails:" or "Here are your search results:" and let the UI handle the display
- Users will see the full email experience with avatars, timestamps, and proper formatting

- IMPORTANT: When calendar tools (getUpcomingEvents, getTodayEvents, getEventDetails, searchEvents) return structured data, do NOT summarize or describe the events in text  
- The events will be displayed automatically using beautiful native calendar event cards with attendee information, times, and locations
- Simply acknowledge that the events are being shown: "Here are your upcoming events:" or "Here's what's on your calendar today:" and let the UI handle the display
- Users will see the full event experience with proper time formatting, attendee status, and event details

IMPORTANT: Only tell users to connect Gmail if you get a specific authentication error (401, "Not connected to Gmail", or token refresh failures). For scope/permission errors (403), ask them to disconnect and reconnect to grant additional permissions. For other errors, show the actual error message to help with debugging.`;

export const SUGGESTED_QUESTIONS = [
  "What was my last email?",
  "Summarise my last 5 emails",
  "Search emails from work",
  "How many unread emails do I have?",
  "Send an email to test@example.com",
  "Reply to my latest email",
  "Show me my upcoming events",
  "What's on my calendar today?",
  "Schedule a meeting with john@gmail.com on Monday",
  "Create an event for next Friday at 2 PM"
] as const;
