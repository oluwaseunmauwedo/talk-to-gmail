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
  let htmlBody = "";
  let isHtml = false;

  const headers = message.payload?.headers || [];
  for (const header of headers) {
    if (header.name === "Subject") subject = header.value;
    if (header.name === "From") from = header.value;
    if (header.name === "Date") date = header.value;
  }

  function extractContentFromPart(part: any): { text: string; html: string; hasHtml: boolean } {
    let text = "";
    let html = "";
    let hasHtml = false;

    if (part.mimeType === "text/plain" && part.body?.data) {
      text = atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"));
    } else if (part.mimeType === "text/html" && part.body?.data) {
      html = atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"));
      hasHtml = true;
      // Also extract text version for fallback
      text = html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"');
    } else if (part.parts) {
      const results = part.parts.map(extractContentFromPart);
      text = results.map((r: { text: string; html: string; hasHtml: boolean }) => r.text).join("\n");
      html = results.map((r: { text: string; html: string; hasHtml: boolean }) => r.html).filter((h: string) => h).join("\n");
      hasHtml = results.some((r: { text: string; html: string; hasHtml: boolean }) => r.hasHtml);
    }

    return { text, html, hasHtml };
  }

  if (message.payload) {
    const content = extractContentFromPart(message.payload);
    body = content.text.trim();
    htmlBody = content.html;
    isHtml = content.hasHtml;
  }

  return {
    id: messageId,
    subject,
    from,
    date,
    body,
    snippet: message.snippet || "",
    htmlBody,
    isHtml
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
