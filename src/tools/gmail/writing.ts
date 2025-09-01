import { tool } from "ai";
import { z } from "zod";
import { getCurrentAgent } from "agents";
import type { Chat } from "@/server";
import { SUCCESS_MESSAGES } from "@/constants";
import {
  getEmailContent,
  handleGmailAuthError,
  handleGmailPermissionError
} from "./helpers";

export const composeAndSendEmail = tool({
  description: "Compose and send a new email",
  parameters: z.object({
    to: z
      .string()
      .describe(
        "Recipient email address (can be multiple separated by commas)"
      ),
    subject: z.string().describe("Email subject line"),
    body: z.string().describe("Email body content (can include HTML)"),
    cc: z
      .string()
      .optional()
      .describe("CC recipients (optional, comma-separated)"),
    bcc: z
      .string()
      .optional()
      .describe("BCC recipients (optional, comma-separated)")
  }),
  execute: async ({ to, subject, body, cc, bcc }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      // Construct the email message in RFC 2822 format
      let message = "";
      message += `To: ${to}\n`;
      if (cc) message += `Cc: ${cc}\n`;
      if (bcc) message += `Bcc: ${bcc}\n`;
      message += `Subject: ${subject}\n`;
      message += `Content-Type: text/html; charset=UTF-8\n`;
      message += `\n${body}`;

      // Encode the message in base64url format
      const encodedMessage = btoa(message)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      // Send the email using Gmail API
      const response = (await agent!.makeGmailApiRequest(
        "users/me/messages/send",
        {
          method: "POST",
          body: JSON.stringify({
            raw: encodedMessage
          })
        }
      )) as any;

      return `${SUCCESS_MESSAGES.EMAIL_SENT}\n\n**Details:**\n• To: ${to}\n• Subject: ${subject}\n${cc ? `• CC: ${cc}\n` : ""}${bcc ? `• BCC: ${bcc}\n` : ""}• Message ID: ${response.id}`;
    } catch (error: any) {
      console.error("Error sending email:", error);

      const authError = handleGmailAuthError(error);
      if (authError) return authError;

      const permissionError = handleGmailPermissionError(error);
      if (permissionError) return `❌ ${permissionError}`;

      return `❌ Error sending email: ${error.message}`;
    }
  }
});

export const forwardEmail = tool({
  description: "Forward an existing email to new recipients",
  parameters: z.object({
    messageId: z.string().describe("Gmail message ID of the email to forward"),
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
  execute: async ({ messageId, to, additionalMessage, cc, bcc }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const originalEmail = await getEmailContent(messageId, agent!);

      const forwardSubject = originalEmail.subject.startsWith("Fwd:")
        ? originalEmail.subject
        : `Fwd: ${originalEmail.subject}`;

      let forwardBody = "";
      if (additionalMessage) {
        forwardBody += `${additionalMessage}\n\n`;
      }

      forwardBody += `---------- Forwarded message ---------\n`;
      forwardBody += `From: ${originalEmail.from}\n`;
      forwardBody += `Date: ${originalEmail.date}\n`;
      forwardBody += `Subject: ${originalEmail.subject}\n\n`;
      forwardBody += originalEmail.body;

      // Construct the email message in RFC 2822 format
      let message = "";
      message += `To: ${to}\n`;
      if (cc) message += `Cc: ${cc}\n`;
      if (bcc) message += `Bcc: ${bcc}\n`;
      message += `Subject: ${forwardSubject}\n`;
      message += `Content-Type: text/html; charset=UTF-8\n`;
      message += `\n${forwardBody}`;

      // Encode the message in base64url format
      const encodedMessage = btoa(message)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      await agent!.makeGmailApiRequest("users/me/messages/send", {
        method: "POST",
        body: JSON.stringify({
          raw: encodedMessage
        })
      });

      return `${SUCCESS_MESSAGES.EMAIL_FORWARDED}\n\n**Original Email:**\n• Subject: ${originalEmail.subject}\n• From: ${originalEmail.from}\n\n**Forwarded To:** ${to}\n${cc ? `**CC:** ${cc}\n` : ""}${bcc ? `**BCC:** ${bcc}\n` : ""}`;
    } catch (error: any) {
      console.error("Error forwarding email:", error);

      const authError = handleGmailAuthError(error);
      if (authError) return authError;

      return `❌ Error forwarding email: ${error.message}`;
    }
  }
});

export const replyToEmail = tool({
  description: "Reply to an existing email, preserving the email thread",
  parameters: z.object({
    messageId: z.string().describe("Gmail message ID of the email to reply to"),
    body: z.string().describe("Reply message content"),
    replyAll: z
      .boolean()
      .default(false)
      .describe(
        "If true, reply to all recipients; if false, reply only to sender"
      )
  }),
  execute: async ({ messageId, body, replyAll }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const originalEmail = await getEmailContent(messageId, agent!);

      // Get the full message to extract thread ID and headers
      const fullMessage = (await agent!.makeGmailApiRequest(
        `users/me/messages/${messageId}?format=full`
      )) as any;

      // Extract necessary headers for reply
      const headers = fullMessage.payload?.headers || [];
      let replyTo = "";
      let messageIdHeader = "";
      let references = "";
      let inReplyTo = "";

      for (const header of headers) {
        if (header.name === "Reply-To") replyTo = header.value;
        if (header.name === "From" && !replyTo) replyTo = header.value;
        if (header.name === "Message-ID") messageIdHeader = header.value;
        if (header.name === "References") references = header.value;
      }

      // Set up In-Reply-To and References for threading
      inReplyTo = messageIdHeader;
      references = references
        ? `${references} ${messageIdHeader}`
        : messageIdHeader;

      // Determine recipients
      let to = replyTo;
      let cc = "";

      if (replyAll) {
        // Extract all original recipients and CC them (excluding the sender's own email)
        for (const header of headers) {
          if (header.name === "To") {
            const toAddresses = header.value
              .split(",")
              .map((addr: string) => addr.trim());
            cc = toAddresses
              .filter((addr: string) => !addr.includes(replyTo))
              .join(", ");
          }
          if (header.name === "Cc") {
            const ccAddresses = header.value
              .split(",")
              .map((addr: string) => addr.trim());
            cc = cc
              ? `${cc}, ${ccAddresses.join(", ")}`
              : ccAddresses.join(", ");
          }
        }
      }

      const replySubject = originalEmail.subject.startsWith("Re:")
        ? originalEmail.subject
        : `Re: ${originalEmail.subject}`;

      // Construct the reply message in RFC 2822 format
      let message = "";
      message += `To: ${to}\n`;
      if (cc) message += `Cc: ${cc}\n`;
      message += `Subject: ${replySubject}\n`;
      message += `In-Reply-To: ${inReplyTo}\n`;
      message += `References: ${references}\n`;
      message += `Content-Type: text/html; charset=UTF-8\n`;
      message += `\n${body}`;

      // Encode the message in base64url format
      const encodedMessage = btoa(message)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      // Send the reply using Gmail API with thread ID to maintain threading
      const response = (await agent!.makeGmailApiRequest(
        "users/me/messages/send",
        {
          method: "POST",
          body: JSON.stringify({
            raw: encodedMessage,
            threadId: fullMessage.threadId
          })
        }
      )) as any;

      return `${SUCCESS_MESSAGES.REPLY_SENT}\n\n**Original Email:**\n• Subject: ${originalEmail.subject}\n• From: ${originalEmail.from}\n\n**Reply Details:**\n• To: ${to}\n${cc ? `• CC: ${cc}\n` : ""}• Reply Type: ${replyAll ? "Reply All" : "Reply"}\n• Message ID: ${response.id}`;
    } catch (error: any) {
      console.error("Error replying to email:", error);

      const authError = handleGmailAuthError(error);
      if (authError) return authError;

      return `❌ Error replying to email: ${error.message}`;
    }
  }
});
