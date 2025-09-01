import { tool } from "ai";
import { z } from "zod";
import { getCurrentAgent } from "agents";
import type { Chat } from "@/server";
import { DEFAULTS } from "@/constants";
import {
  getEmailContent,
  handleGmailAuthError,
  formatEmailForList,
  formatEmailForSummary
} from "./helpers";

export const getLatestEmails = tool({
  description: "Get the latest emails from Gmail inbox",
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
        return "No emails found in inbox.";
      }

      const emails = [];
      for (const message of response.messages.slice(0, count)) {
        try {
          const emailContent = await getEmailContent(message.id, agent!);
          emails.push(emailContent);
        } catch (error) {
          console.error(`Error fetching email ${message.id}:`, error);
        }
      }

      if (emails.length === 0) {
        return "No emails could be retrieved.";
      }

      return (
        `Found ${emails.length} recent emails:\n\n` +
        emails.map(formatEmailForList).join("\n")
      );
    } catch (error: any) {
      console.error("Error fetching latest emails:", error);

      const authError = handleGmailAuthError(error);
      if (authError) return authError;

      return `Error fetching emails: ${error.message}`;
    }
  }
});

export const searchEmails = tool({
  description:
    "Search emails in Gmail by query (sender, subject, content, etc.)",
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
        return `No emails found matching query: "${query}"`;
      }

      const emails = [];
      for (const message of response.messages.slice(0, count)) {
        try {
          const emailContent = await getEmailContent(message.id, agent!);
          emails.push(emailContent);
        } catch (error) {
          console.error(`Error fetching email ${message.id}:`, error);
        }
      }

      if (emails.length === 0) {
        return `No emails could be retrieved for query: "${query}"`;
      }

      return (
        `Found ${emails.length} emails matching "${query}":\n\n` +
        emails
          .map(
            (email, index) =>
              `${index + 1}. **${email.subject}**\n` +
              `   From: ${email.from}\n` +
              `   Date: ${email.date}\n` +
              `   Preview: ${email.snippet}\n`
          )
          .join("\n")
      );
    } catch (error: any) {
      console.error("Error searching emails:", error);

      const authError = handleGmailAuthError(error);
      if (authError) return authError;

      return `Error searching emails: ${error.message}`;
    }
  }
});

export const getEmailDetails = tool({
  description:
    "Get full details of a specific email including complete content",
  parameters: z.object({
    messageId: z.string().describe("Gmail message ID")
  }),
  execute: async ({ messageId }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const email = await getEmailContent(messageId, agent!);

      return (
        `**Email Details:**\n\n` +
        `**Subject:** ${email.subject}\n` +
        `**From:** ${email.from}\n` +
        `**Date:** ${email.date}\n\n` +
        `**Content:**\n${email.body}`
      );
    } catch (error: any) {
      console.error("Error fetching email details:", error);

      const authError = handleGmailAuthError(error);
      if (authError) return authError;

      return `Error fetching email details: ${error.message}`;
    }
  }
});

export const getUnreadEmailCount = tool({
  description: "Get the count of unread emails in Gmail inbox",
  parameters: z.object({}),
  execute: async () => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const response = (await agent!.makeGmailApiRequest(
        "users/me/labels/UNREAD"
      )) as any;

      const unreadCount = response.messagesUnread || 0;

      if (unreadCount === 0) {
        return "You have no unread emails.";
      } else {
        return `You have ${unreadCount} unread email${unreadCount === 1 ? "" : "s"}.`;
      }
    } catch (error: any) {
      console.error("Error fetching unread count:", error);

      const authError = handleGmailAuthError(error);
      if (authError) return authError;

      return `Error fetching unread email count: ${error.message}`;
    }
  }
});

export const summarizeEmails = tool({
  description:
    "Get a summary of recent emails with key information (excludes sent emails)",
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
        return "No emails found to summarize.";
      }

      const emails = [];
      for (const message of response.messages.slice(0, count)) {
        try {
          const emailContent = await getEmailContent(message.id, agent!);
          emails.push(emailContent);
        } catch (error) {
          console.error(`Error fetching email ${message.id}:`, error);
        }
      }

      if (emails.length === 0) {
        return "No emails could be retrieved for summarization.";
      }

      return (
        `**Summary of ${emails.length} Recent Emails:**\n\n` +
        emails.map(formatEmailForSummary).join("\n")
      );
    } catch (error: any) {
      console.error("Error summarizing emails:", error);

      const authError = handleGmailAuthError(error);
      if (authError) return authError;

      return `Error summarizing emails: ${error.message}`;
    }
  }
});

export const getAllEmails = tool({
  description: "Get recent emails including both received and sent emails",
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
        return "No emails found.";
      }

      const emails = [];
      for (const message of response.messages.slice(0, count)) {
        try {
          const emailContent = await getEmailContent(message.id, agent!);
          emails.push(emailContent);
        } catch (error) {
          console.error(`Error fetching email ${message.id}:`, error);
        }
      }

      if (emails.length === 0) {
        return "No emails could be retrieved.";
      }

      return (
        `Found ${emails.length} recent emails (including sent):\n\n` +
        emails.map(formatEmailForList).join("\n")
      );
    } catch (error: any) {
      console.error("Error fetching all emails:", error);

      const authError = handleGmailAuthError(error);
      if (authError) return authError;

      return `Error fetching emails: ${error.message}`;
    }
  }
});
