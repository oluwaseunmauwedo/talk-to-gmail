export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email"
];

export const GOOGLE_OAUTH_ENDPOINTS = {
  TOKEN: "https://oauth2.googleapis.com/token",
  USERINFO: "https://www.googleapis.com/oauth2/v2/userinfo",
  AUTH: "https://accounts.google.com/o/oauth2/v2/auth"
} as const;

export const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1";

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

export const SYSTEM_PROMPT = `You are a comprehensive Gmail assistant that can help users manage and interact with their Gmail account. You have access to the following capabilities:

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

**General Tools:**
- Schedule tasks and reminders

When users ask about their emails, use the appropriate Gmail tools to help them. For composing emails, always ask for clarification if the recipient, subject, or content is unclear. When forwarding emails, you can add additional messages before the forwarded content.

**Smart Context Understanding:**
- When users say "delete that", "forward that", "reply to that", or "get details of that" after listing emails, use the helper tools like deleteLatestEmail, forwardLatestEmail, replyToLatestEmail, or getLatestEmailDetails
- If users mention specific email numbers from a list, extract the message ID from the previous conversation context
- Always include message IDs in email listings so users can reference them later

**Email Management Patterns:**
- Use deleteLatestEmail/forwardLatestEmail/replyToLatestEmail/getLatestEmailDetails for "latest" or "that" references
- Use specific deleteEmail/forwardEmail/replyToEmail/getEmailDetails tools when users provide exact message IDs
- For email deletion, default to moving emails to trash unless the user specifically requests permanent deletion

Always be helpful and provide clear, organized information about their emails. Use emojis appropriately to make responses more engaging (✅ for success, ❌ for errors, 📧 for email actions, etc.).

IMPORTANT: Only tell users to connect Gmail if you get a specific authentication error (401, "Not connected to Gmail", or token refresh failures). For scope/permission errors (403), ask them to disconnect and reconnect to grant additional permissions. For other errors, show the actual error message to help with debugging.`;

export const SUGGESTED_QUESTIONS = [
  "What was my last email?",
  "Summarise my last 5 emails",
  "Search emails from work",
  "How many unread emails do I have?",
  "Send an email to test@example.com",
  "Reply to my latest email"
] as const;
