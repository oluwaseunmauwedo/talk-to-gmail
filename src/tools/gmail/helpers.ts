import type { Chat } from "@/server";
import type { EmailContent } from "@/types";
import { ERROR_MESSAGES } from "@/constants";

export async function getEmailContent(
  messageId: string,
  agent: Chat
): Promise<EmailContent> {
  const message = (await agent.makeGmailApiRequest(
    `users/me/messages/${messageId}?format=full`
  )) as any;

  let subject = "";
  let from = "";
  let date = "";
  let body = "";

  const headers = message.payload?.headers || [];
  for (const header of headers) {
    if (header.name === "Subject") subject = header.value;
    if (header.name === "From") from = header.value;
    if (header.name === "Date") date = header.value;
  }

  function extractTextFromPart(part: any): string {
    if (part.mimeType === "text/plain" && part.body?.data) {
      return atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"));
    }
    if (part.mimeType === "text/html" && part.body?.data) {
      const html = atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"));
      // Simple HTML to text conversion (remove tags)
      return html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&");
    }
    if (part.parts) {
      return part.parts.map(extractTextFromPart).join("\n");
    }
    return "";
  }

  if (message.payload) {
    body = extractTextFromPart(message.payload);
  }

  return {
    id: messageId,
    subject,
    from,
    date,
    body: body.trim(),
    snippet: message.snippet || ""
  };
}

export function handleGmailAuthError(error: any): string | null {
  if (
    error.message.includes("Gmail API error: 401") ||
    error.message.includes("Not connected to Gmail") ||
    error.message.includes("Failed to refresh Gmail token")
  ) {
    return 'You need to connect your Gmail account first using the "Connect Gmail" button. Once connected, I can help you with your emails!';
  }
  return null;
}

export function handleGmailPermissionError(error: any): string | null {
  if (
    error.message.includes("Gmail API error: 403") ||
    error.message.includes("insufficient scope")
  ) {
    return ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS;
  }
  return null;
}

export function formatEmailForList(email: EmailContent, index: number): string {
  return (
    `${index + 1}. **${email.subject}**\n` +
    `   From: ${email.from}\n` +
    `   Date: ${email.date}\n` +
    `   Preview: ${email.snippet}\n` +
    `   ID: \`${email.id}\`\n`
  );
}

export function formatEmailForSummary(
  email: EmailContent,
  index: number
): string {
  return (
    `**${index + 1}. ${email.subject}**\n` +
    `• From: ${email.from}\n` +
    `• Date: ${new Date(email.date).toLocaleDateString()}\n` +
    `• Summary: ${email.snippet || email.body.substring(0, 100) + "..."}\n`
  );
}
