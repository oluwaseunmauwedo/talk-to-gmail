import { tool } from "ai";
import { z } from "zod";
import { getCurrentAgent } from "agents";
import type { Chat } from "@/server";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import {
  getEmailContent,
  handleGmailAuthError,
  handleGmailPermissionError
} from "./helpers";

export const deleteEmail = tool({
  description:
    "Delete an email (move to trash or permanently delete). Use this when user wants to delete a specific email by message ID.",
  parameters: z.object({
    messageId: z.string().describe("Gmail message ID of the email to delete"),
    permanent: z
      .boolean()
      .default(false)
      .describe(
        "If true, permanently delete the email; if false, move to trash"
      )
  }),
  execute: async ({ messageId, permanent }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      if (!messageId || messageId.length < 10) {
        return `❌ ${ERROR_MESSAGES.INVALID_MESSAGE_ID}`;
      }

      const email = await getEmailContent(messageId, agent!);

      if (permanent) {
        await agent!.makeGmailApiRequest(`users/me/messages/${messageId}`, {
          method: "DELETE"
        });

        return `${SUCCESS_MESSAGES.EMAIL_DELETED}\n\n**Deleted Email:**\n• Subject: ${email.subject}\n• From: ${email.from}\n• Date: ${email.date}\n\n⚠️ This email cannot be recovered.`;
      } else {
        await agent!.makeGmailApiRequest(
          `users/me/messages/${messageId}/trash`,
          {
            method: "POST"
          }
        );

        return `${SUCCESS_MESSAGES.EMAIL_MOVED_TO_TRASH}\n\n**Moved Email:**\n• Subject: ${email.subject}\n• From: ${email.from}\n• Date: ${email.date}\n\n💡 You can still recover this email from the trash folder.`;
      }
    } catch (error: any) {
      console.error("Error deleting email:", error);

      if (
        error.message.includes("Gmail API error: 404") ||
        error.message.includes("Requested entity was not found")
      ) {
        return "❌ Email not found. The email may have already been deleted or the message ID is invalid. Please check the email list again and use the correct message ID.";
      }

      const authError = handleGmailAuthError(error);
      if (authError) return authError;

      const permissionError = handleGmailPermissionError(error);
      if (permissionError) return `❌ ${permissionError}`;

      return `❌ Error deleting email: ${error.message}`;
    }
  }
});

export const markEmailAsReadOrUnread = tool({
  description: "Mark an email as read or unread",
  parameters: z.object({
    messageId: z.string().describe("Gmail message ID of the email to mark"),
    markAsRead: z
      .boolean()
      .describe("If true, mark as read; if false, mark as unread")
  }),
  execute: async ({ messageId, markAsRead }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const email = await getEmailContent(messageId, agent!);

      if (markAsRead) {
        await agent!.makeGmailApiRequest(
          `users/me/messages/${messageId}/modify`,
          {
            method: "POST",
            body: JSON.stringify({
              removeLabelIds: ["UNREAD"]
            })
          }
        );

        return `${SUCCESS_MESSAGES.EMAIL_MARKED_READ}\n\n**Email:**\n• Subject: ${email.subject}\n• From: ${email.from}\n• Date: ${email.date}`;
      } else {
        await agent!.makeGmailApiRequest(
          `users/me/messages/${messageId}/modify`,
          {
            method: "POST",
            body: JSON.stringify({
              addLabelIds: ["UNREAD"]
            })
          }
        );

        return `${SUCCESS_MESSAGES.EMAIL_MARKED_UNREAD}\n\n**Email:**\n• Subject: ${email.subject}\n• From: ${email.from}\n• Date: ${email.date}`;
      }
    } catch (error: any) {
      console.error("Error marking email:", error);

      const authError = handleGmailAuthError(error);
      if (authError) return authError;

      return `❌ Error marking email: ${error.message}`;
    }
  }
});

export const manageEmailLabels = tool({
  description: "Add or remove labels from an email",
  parameters: z.object({
    messageId: z.string().describe("Gmail message ID of the email"),
    action: z
      .enum(["add", "remove"])
      .describe("Whether to add or remove labels"),
    labelNames: z
      .array(z.string())
      .describe(
        "List of label names to add or remove (e.g., ['Important', 'Work'])"
      )
  }),
  execute: async ({ messageId, action, labelNames }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const labelsResponse = (await agent!.makeGmailApiRequest(
        "users/me/labels"
      )) as any;
      const availableLabels = labelsResponse.labels || [];

      const labelIds: string[] = [];
      const notFoundLabels: string[] = [];

      for (const labelName of labelNames) {
        const label = availableLabels.find(
          (l: any) => l.name.toLowerCase() === labelName.toLowerCase()
        );
        if (label) {
          labelIds.push(label.id);
        } else {
          notFoundLabels.push(labelName);
        }
      }

      if (labelIds.length === 0) {
        return `❌ None of the specified labels were found: ${labelNames.join(", ")}\n\nAvailable labels: ${availableLabels
          .map((l: any) => l.name)
          .slice(0, 10)
          .join(", ")}${availableLabels.length > 10 ? "..." : ""}`;
      }

      const email = await getEmailContent(messageId, agent!);

      const requestBody: any = {};
      if (action === "add") {
        requestBody.addLabelIds = labelIds;
      } else {
        requestBody.removeLabelIds = labelIds;
      }

      await agent!.makeGmailApiRequest(
        `users/me/messages/${messageId}/modify`,
        {
          method: "POST",
          body: JSON.stringify(requestBody)
        }
      );

      const actionText = action === "add" ? "added to" : "removed from";
      const foundLabelNames = labelIds
        .map((id) => availableLabels.find((l: any) => l.id === id)?.name)
        .filter(Boolean);

      let result = `🏷️ Labels ${actionText} email successfully!\n\n**Email:**\n• Subject: ${email.subject}\n• From: ${email.from}\n\n**Labels ${action === "add" ? "Added" : "Removed"}:** ${foundLabelNames.join(", ")}`;

      if (notFoundLabels.length > 0) {
        result += `\n\n⚠️ **Labels not found:** ${notFoundLabels.join(", ")}`;
      }

      return result;
    } catch (error: any) {
      console.error("Error managing email labels:", error);

      const authError = handleGmailAuthError(error);
      if (authError) return authError;

      return `❌ Error managing email labels: ${error.message}`;
    }
  }
});

export const listEmailLabels = tool({
  description:
    "List all available Gmail labels and get the labels for a specific email",
  parameters: z.object({
    messageId: z
      .string()
      .optional()
      .describe("Optional: Gmail message ID to get labels for a specific email")
  }),
  execute: async ({ messageId }) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const labelsResponse = (await agent!.makeGmailApiRequest(
        "users/me/labels"
      )) as any;
      const availableLabels = labelsResponse.labels || [];

      const systemLabels = availableLabels.filter(
        (l: any) => l.type === "system"
      );
      const userLabels = availableLabels.filter((l: any) => l.type === "user");

      let result = `🏷️ **Available Gmail Labels:**\n\n`;

      if (userLabels.length > 0) {
        result += `**Custom Labels:**\n${userLabels.map((l: any) => `• ${l.name}`).join("\n")}\n\n`;
      }

      result += `**System Labels:**\n${systemLabels.map((l: any) => `• ${l.name}`).join("\n")}`;

      if (messageId) {
        try {
          const messageResponse = (await agent!.makeGmailApiRequest(
            `users/me/messages/${messageId}?format=minimal`
          )) as any;

          const messageLabelIds = messageResponse.labelIds || [];
          const messageLabels = messageLabelIds
            .map(
              (id: string) =>
                availableLabels.find((l: any) => l.id === id)?.name
            )
            .filter(Boolean);

          const email = await getEmailContent(messageId, agent!);

          result += `\n\n**Labels for Email:**\n• Subject: ${email.subject}\n• From: ${email.from}\n• Labels: ${messageLabels.length > 0 ? messageLabels.join(", ") : "No labels"}`;
        } catch (error) {
          result += `\n\n❌ Could not retrieve labels for the specified email.`;
        }
      }

      return result;
    } catch (error: any) {
      console.error("Error listing email labels:", error);

      const authError = handleGmailAuthError(error);
      if (authError) return authError;

      return `❌ Error listing email labels: ${error.message}`;
    }
  }
});
