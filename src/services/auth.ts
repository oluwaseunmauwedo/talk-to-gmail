import type { Env, TokenResponse, UserInfo, StoredTokenData } from "@/types";
import {
  GMAIL_SCOPES,
  GOOGLE_OAUTH_ENDPOINTS,
  ERROR_MESSAGES
} from "@/constants";

export async function handleGmailOAuthConnect(_request: Request, env: Env) {
  const clientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return Response.json(
      { error: ERROR_MESSAGES.GMAIL_NOT_CONFIGURED },
      { status: 500 }
    );
  }

  const scopes = GMAIL_SCOPES.join(" ");

  const authUrl = new URL(GOOGLE_OAUTH_ENDPOINTS.AUTH);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  return Response.redirect(authUrl.toString(), 302);
}

export async function handleGmailOAuthCallback(request: Request, env: Env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return new Response(
      `
      <html>
        <body>
          <h1>OAuth Error</h1>
          <p>Error: ${error}</p>
          <script>window.close();</script>
        </body>
      </html>
    `,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code) {
    return new Response("No authorization code received", { status: 400 });
  }

  try {
    const clientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret =
      env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;

    const tokenResponse = await fetch(GOOGLE_OAUTH_ENDPOINTS.TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri!
      })
    });

    const tokens = (await tokenResponse.json()) as TokenResponse;

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${JSON.stringify(tokens)}`);
    }

    const userResponse = await fetch(GOOGLE_OAUTH_ENDPOINTS.USERINFO, {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    const userInfo = (await userResponse.json()) as UserInfo;

    const tokenData: StoredTokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
      email: userInfo.email,
      name: userInfo.name
    };

    await env.GMAIL_TOKENS.put("user_tokens", JSON.stringify(tokenData));

    return new Response(
      `
      <html>
        <body>
          <h1>Gmail Connected Successfully!</h1>
          <p>Connected to: ${userInfo.email}</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
    `,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error: unknown) {
    console.error("OAuth callback error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      `
      <html>
        <body>
          <h1>OAuth Error</h1>
          <p>Failed to connect Gmail: ${errorMessage}</p>
          <script>window.close();</script>
        </body>
      </html>
    `,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}

export async function handleGmailOAuthStatus(_request: Request, env: Env) {
  try {
    const tokenData = await env.GMAIL_TOKENS.get("user_tokens");
    if (!tokenData) {
      return Response.json({ connected: false });
    }

    const tokens: StoredTokenData = JSON.parse(tokenData);
    const isExpired = Date.now() >= tokens.expires_at;

    return Response.json({
      connected: true,
      email: tokens.email,
      name: tokens.name,
      expired: isExpired
    });
  } catch (error) {
    console.error("Status check error:", error);
    return Response.json({ connected: false });
  }
}

export async function handleGmailOAuthDisconnect(_request: Request, env: Env) {
  try {
    await env.GMAIL_TOKENS.delete("user_tokens");
    return Response.json({ success: true });
  } catch (error) {
    console.error("Disconnect error:", error);
    return Response.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}

export async function getValidGmailToken(env: Env): Promise<string> {
  const tokenData = await env.GMAIL_TOKENS.get("user_tokens");
  if (!tokenData) {
    throw new Error(ERROR_MESSAGES.NOT_CONNECTED);
  }

  const tokens: StoredTokenData = JSON.parse(tokenData);

  if (Date.now() < tokens.expires_at) {
    return tokens.access_token;
  }

  if (!tokens.refresh_token) {
    throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
  }

  try {
    const clientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret =
      env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

    const refreshResponse = await fetch(GOOGLE_OAUTH_ENDPOINTS.TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        refresh_token: tokens.refresh_token,
        grant_type: "refresh_token"
      })
    });

    const newTokens = (await refreshResponse.json()) as TokenResponse;

    if (!refreshResponse.ok) {
      throw new Error(`Token refresh failed: ${JSON.stringify(newTokens)}`);
    }

    const updatedTokenData: StoredTokenData = {
      ...tokens,
      access_token: newTokens.access_token,
      expires_at: Date.now() + newTokens.expires_in * 1000
    };

    await env.GMAIL_TOKENS.put("user_tokens", JSON.stringify(updatedTokenData));
    return newTokens.access_token;
  } catch (error) {
    console.error("Token refresh error:", error);
    throw new Error(ERROR_MESSAGES.TOKEN_REFRESH_FAILED);
  }
}
