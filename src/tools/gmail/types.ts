import type { Chat } from "@/server";

export interface GmailToolContext {
  agent: Chat;
}

export interface EmailSearchParams {
  query: string;
  count: number;
}

export interface EmailComposeParams {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

export interface EmailForwardParams {
  messageId: string;
  to: string;
  additionalMessage?: string;
  cc?: string;
  bcc?: string;
}

export interface EmailReplyParams {
  messageId: string;
  body: string;
  replyAll?: boolean;
}

export interface EmailLabelParams {
  messageId: string;
  action: "add" | "remove";
  labelNames: string[];
}
