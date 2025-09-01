export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface UserInfo {
  email: string;
  name: string;
  id: string;
}

export interface StoredTokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  email: string;
  name: string;
}

export interface GmailConnectionStatus {
  connected: boolean;
  email?: string;
  name?: string;
  loading: boolean;
}

export interface EmailContent {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
  snippet: string;
}

export interface GmailMessage {
  id: string;
  threadId?: string;
  labelIds?: string[];
  snippet?: string;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
    mimeType?: string;
    body?: { data?: string };
    parts?: any[];
  };
}

export interface GmailLabel {
  id: string;
  name: string;
  type: "system" | "user";
  messagesTotal?: number;
  messagesUnread?: number;
}

export interface GmailApiRequestOptions {
  method?: string;
  body?: string;
}

export interface SuggestedQuestion {
  text: string;
  action: () => void;
}

export type Theme = "dark" | "light";

export interface Env {
  OPENAI_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URI?: string;
  GMAIL_TOKENS: KVNamespace;
}
