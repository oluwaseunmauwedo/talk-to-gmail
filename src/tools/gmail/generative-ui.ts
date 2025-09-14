import { tool } from "ai";
import { z } from "zod";
import { getCurrentAgent } from "agents";
import type { Chat } from "@/server";
import { DEFAULTS } from "@/constants";
import { getEmailContent, handleGmailAuthError } from "./helpers";
import type { EmailContent } from "@/types";

// These tools return structured data for generative UI instead of markdown strings

export const getLatestEmailsUI = tool({
  description:
    "Get the latest emails from Gmail inbox with structured data for UI rendering",
  parameters: z.object({
    count: z
      .number()
      .min(DEFAULTS.MIN_EMAIL_COUNT)
      .max(DEFAULTS.MAX_EMAIL_COUNT)
      .default(DEFAULTS.EMAIL_COUNT)
      .describe(
        `Number of emails to retrieve (${DEFAULTS.MIN_EMAIL_COUNT}-${DEFAULTS.MAX_EMAIL_COUNT})`
      )
  }),
  execute: async ({ count }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const response = (await agent!.makeGmailApiRequest(
        `users/me/messages?labelIds=INBOX&maxResults=${count}`
      )) as any;

      if (!response.messages || response.messages.length === 0) {
        return {
          type: "emails",
          emails: [],
          title: "Latest Emails",
          message: "No emails found in inbox."
        };
      }

      const emails: EmailContent[] = [];
      for (const message of response.messages.slice(0, count)) {
        try {
          const emailContent = await getEmailContent(message.id, agent!);
          emails.push(emailContent);
        } catch (error) {
          console.error(`Error fetching email ${message.id}:`, error);
        }
      }

      return {
        type: "emails",
        emails,
        title: "Latest Emails",
        subtitle: `Found ${emails.length} recent emails from your inbox`,
        count: emails.length
      };
    } catch (error: any) {
      console.error("Error fetching latest emails:", error);

      const authError = handleGmailAuthError(error);
      if (authError) {
        return {
          type: "error",
          message: authError
        };
      }

      return {
        type: "error",
        message: `Error fetching emails: ${error.message}`
      };
    }
  }
});

export const searchEmailsUI = tool({
  description: "Search emails in Gmail with structured data for UI rendering",
  parameters: z.object({
    query: z
      .string()
      .describe(
        "Gmail search query (e.g., 'from:john@example.com', 'subject:meeting', 'after:2024/01/01')"
      ),
    count: z
      .number()
      .min(DEFAULTS.MIN_EMAIL_COUNT)
      .max(DEFAULTS.MAX_EMAIL_COUNT)
      .default(10)
      .describe(
        `Number of emails to retrieve (${DEFAULTS.MIN_EMAIL_COUNT}-${DEFAULTS.MAX_EMAIL_COUNT})`
      )
  }),
  execute: async ({ query, count }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const response = (await agent!.makeGmailApiRequest(
        `users/me/messages?q=${encodeURIComponent(query)}&maxResults=${count}`
      )) as any;

      if (!response.messages || response.messages.length === 0) {
        return {
          type: "emails",
          emails: [],
          title: "Search Results",
          subtitle: `No emails found matching "${query}"`,
          query
        };
      }

      const emails: EmailContent[] = [];
      for (const message of response.messages.slice(0, count)) {
        try {
          const emailContent = await getEmailContent(message.id, agent!);
          emails.push(emailContent);
        } catch (error) {
          console.error(`Error fetching email ${message.id}:`, error);
        }
      }

      return {
        type: "emails",
        emails,
        title: "Search Results",
        subtitle: `Found ${emails.length} emails matching "${query}"`,
        query,
        count: emails.length
      };
    } catch (error: any) {
      console.error("Error searching emails:", error);

      const authError = handleGmailAuthError(error);
      if (authError) {
        return {
          type: "error",
          message: authError
        };
      }

      return {
        type: "error",
        message: `Error searching emails: ${error.message}`
      };
    }
  }
});

export const getEmailDetailsUI = tool({
  description:
    "Get full details of a specific email with structured data for UI rendering",
  parameters: z.object({
    messageId: z.string().describe("Gmail message ID")
  }),
  execute: async ({ messageId }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const email = await getEmailContent(messageId, agent!);

      return {
        type: "email_detail",
        email,
        title: "Email Details"
      };
    } catch (error: any) {
      console.error("Error fetching email details:", error);

      const authError = handleGmailAuthError(error);
      if (authError) {
        return {
          type: "error",
          message: authError
        };
      }

      return {
        type: "error",
        message: `Error fetching email details: ${error.message}`
      };
    }
  }
});

export const summarizeEmailsUI = tool({
  description:
    "Get a summary of recent emails with structured data for UI rendering",
  parameters: z.object({
    count: z
      .number()
      .min(DEFAULTS.MIN_EMAIL_COUNT)
      .max(DEFAULTS.MAX_SUMMARIZE_COUNT)
      .default(DEFAULTS.EMAIL_COUNT)
      .describe(
        `Number of recent emails to summarize (${DEFAULTS.MIN_EMAIL_COUNT}-${DEFAULTS.MAX_SUMMARIZE_COUNT})`
      )
  }),
  execute: async ({ count }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const response = (await agent!.makeGmailApiRequest(
        `users/me/messages?labelIds=INBOX&maxResults=${count}`
      )) as any;

      if (!response.messages || response.messages.length === 0) {
        return {
          type: "emails",
          emails: [],
          title: "Email Summary",
          message: "No emails found to summarize."
        };
      }

      const emails: EmailContent[] = [];
      for (const message of response.messages.slice(0, count)) {
        try {
          const emailContent = await getEmailContent(message.id, agent!);
          emails.push(emailContent);
        } catch (error) {
          console.error(`Error fetching email ${message.id}:`, error);
        }
      }

      return {
        type: "emails",
        emails,
        title: "Email Summary",
        subtitle: `Summary of ${emails.length} recent emails`,
        compact: true,
        maxItems: count
      };
    } catch (error: any) {
      console.error("Error summarizing emails:", error);

      const authError = handleGmailAuthError(error);
      if (authError) {
        return {
          type: "error",
          message: authError
        };
      }

      return {
        type: "error",
        message: `Error summarizing emails: ${error.message}`
      };
    }
  }
});

export const getAllEmailsUI = tool({
  description:
    "Get recent emails including both received and sent emails with structured data for UI rendering",
  parameters: z.object({
    count: z
      .number()
      .min(DEFAULTS.MIN_EMAIL_COUNT)
      .max(DEFAULTS.MAX_EMAIL_COUNT)
      .default(DEFAULTS.EMAIL_COUNT)
      .describe(
        `Number of emails to retrieve (${DEFAULTS.MIN_EMAIL_COUNT}-${DEFAULTS.MAX_EMAIL_COUNT})`
      )
  }),
  execute: async ({ count }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const response = (await agent!.makeGmailApiRequest(
        `users/me/messages?maxResults=${count}`
      )) as any;

      if (!response.messages || response.messages.length === 0) {
        return {
          type: "emails",
          emails: [],
          title: "All Recent Emails",
          message: "No emails found."
        };
      }

      const emails: EmailContent[] = [];
      for (const message of response.messages.slice(0, count)) {
        try {
          const emailContent = await getEmailContent(message.id, agent!);
          emails.push(emailContent);
        } catch (error) {
          console.error(`Error fetching email ${message.id}:`, error);
        }
      }

      return {
        type: "emails",
        emails,
        title: "All Recent Emails",
        subtitle: `Found ${emails.length} recent emails (including sent)`,
        count: emails.length
      };
    } catch (error: any) {
      console.error("Error fetching all emails:", error);

      const authError = handleGmailAuthError(error);
      if (authError) {
        return {
          type: "error",
          message: authError
        };
      }

      return {
        type: "error",
        message: `Error fetching emails: ${error.message}`
      };
    }
  }
});
