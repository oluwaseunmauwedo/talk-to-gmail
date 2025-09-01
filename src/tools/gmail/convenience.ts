import { tool } from "ai";
import { z } from "zod";
import { getCurrentAgent } from "agents";
import type { Chat } from "@/server";
import { deleteEmail } from "./management";
import { getEmailDetails } from "./reading";
import { forwardEmail, replyToEmail } from "./writing";

export const deleteLatestEmail = tool({
  description:
    "Delete the most recent email from the inbox. Use this when user says 'delete my latest email' or 'delete the most recent email'.",
  parameters: z.object({
    permanent: z
      .boolean()
      .default(false)
      .describe(
        "If true, permanently delete the email; if false, move to trash"
      )
  }),
  execute: async ({ permanent }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      // Get the latest email from inbox
      const response = (await agent!.makeGmailApiRequest(
        `users/me/messages?labelIds=INBOX&maxResults=1`
      )) as any;

      if (!response.messages || response.messages.length === 0) {
        return "❌ No emails found in inbox to delete.";
      }

      const latestMessageId = response.messages[0].id;

      // Delete the email directly
      return await deleteEmail.execute!(
        { messageId: latestMessageId, permanent },
        {} as any
      );
    } catch (error: any) {
      console.error("Error deleting latest email:", error);
      return `❌ Error deleting latest email: ${error.message}`;
    }
  }
});

export const getLatestEmailDetails = tool({
  description:
    "Get full details of the most recent email from the inbox. Use this when user says 'get details of my latest email' or 'show me details of that email' after listing emails.",
  parameters: z.object({}),
  execute: async () => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      // Get the latest email from inbox
      const response = (await agent!.makeGmailApiRequest(
        `users/me/messages?labelIds=INBOX&maxResults=1`
      )) as any;

      if (!response.messages || response.messages.length === 0) {
        return "❌ No emails found in inbox.";
      }

      const latestMessageId = response.messages[0].id;

      // Get details using the existing functionality
      return await getEmailDetails.execute!(
        { messageId: latestMessageId },
        {} as any
      );
    } catch (error: any) {
      console.error("Error getting latest email details:", error);
      return `❌ Error getting latest email details: ${error.message}`;
    }
  }
});

export const forwardLatestEmail = tool({
  description:
    "Forward the most recent email from the inbox. Use this when user says 'forward my latest email' or 'forward the most recent email'.",
  parameters: z.object({
    to: z
      .string()
      .describe(
        "Recipient email address (can be multiple separated by commas)"
      ),
    additionalMessage: z
      .string()
      .optional()
      .describe("Additional message to add before the forwarded content"),
    cc: z
      .string()
      .optional()
      .describe("CC recipients (optional, comma-separated)"),
    bcc: z
      .string()
      .optional()
      .describe("BCC recipients (optional, comma-separated)")
  }),
  execute: async ({ to, additionalMessage, cc, bcc }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      // Get the latest email from inbox
      const response = (await agent!.makeGmailApiRequest(
        `users/me/messages?labelIds=INBOX&maxResults=1`
      )) as any;

      if (!response.messages || response.messages.length === 0) {
        return "❌ No emails found in inbox to forward.";
      }

      const latestMessageId = response.messages[0].id;

      // Forward the email directly
      return await forwardEmail.execute!(
        { messageId: latestMessageId, to, additionalMessage, cc, bcc },
        {} as any
      );
    } catch (error: any) {
      console.error("Error forwarding latest email:", error);
      return `❌ Error forwarding latest email: ${error.message}`;
    }
  }
});

export const replyToLatestEmail = tool({
  description:
    "Reply to the most recent email from the inbox. Use this when user says 'reply to my latest email' or 'reply to the most recent email'.",
  parameters: z.object({
    body: z.string().describe("Reply message content"),
    replyAll: z
      .boolean()
      .default(false)
      .describe(
        "If true, reply to all recipients; if false, reply only to sender"
      )
  }),
  execute: async ({ body, replyAll }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      // Get the latest email from inbox
      const response = (await agent!.makeGmailApiRequest(
        `users/me/messages?labelIds=INBOX&maxResults=1`
      )) as any;

      if (!response.messages || response.messages.length === 0) {
        return "❌ No emails found in inbox to reply to.";
      }

      const latestMessageId = response.messages[0].id;

      // Reply to the email directly
      return await replyToEmail.execute!(
        { messageId: latestMessageId, body, replyAll },
        {} as any
      );
    } catch (error: any) {
      console.error("Error replying to latest email:", error);
      return `❌ Error replying to latest email: ${error.message}`;
    }
  }
});
