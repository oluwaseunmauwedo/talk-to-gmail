import { routeAgentRequest, type Schedule } from "agents";
import { unstable_getSchedulePrompt } from "agents/schedule";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  createDataStreamResponse,
  generateId,
  streamText,
  type StreamTextOnFinishCallback,
  type ToolSet
} from "ai";
import { openai } from "@ai-sdk/openai";

// Local imports
import { processToolCalls } from "./utils";
import { tools } from "./tools";
import {
  handleGmailOAuthConnect,
  handleGmailOAuthCallback,
  handleGmailOAuthStatus,
  handleGmailOAuthDisconnect,
  getValidGmailToken
} from "./services/auth";
import type { Env, GmailApiRequestOptions } from "./types";
import { ROUTES, GMAIL_API_BASE, SYSTEM_PROMPT } from "./constants";

const model = openai("gpt-5-mini");

/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class Chat extends AIChatAgent<Env> {
  /**
   * Handles incoming chat messages and manages the response stream
   * @param onFinish - Callback function executed when streaming completes
   */

  // Public method for tools to access Gmail functionality
  async getGmailToken() {
    return getValidGmailToken(this.env);
  }

  async makeGmailApiRequest(
    endpoint: string,
    options?: GmailApiRequestOptions
  ) {
    const accessToken = await this.getGmailToken();
    const response = await fetch(`${GMAIL_API_BASE}/${endpoint}`, {
      method: options?.method || "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: options?.body
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail API error: ${response.status} ${error}`);
    }

    // Handle DELETE requests that might not return JSON
    if (options?.method === "DELETE") {
      return response.status === 204 ? {} : response.json();
    }

    return response.json();
  }

  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    _options?: { abortSignal?: AbortSignal }
  ) {
    // const mcpConnection = await this.mcp.connect(
    //   "https://path-to-mcp-server/sse"
    // );

    // Collect all tools, including MCP tools
    const allTools = {
      ...tools,
      ...this.mcp.unstable_getAITools()
    };

    // Create a streaming response that handles both text and tool outputs
    const dataStreamResponse = createDataStreamResponse({
      execute: async (dataStream) => {
        // Process any pending tool calls from previous messages
        // This handles human-in-the-loop confirmations for tools
        const processedMessages = await processToolCalls({
          messages: this.messages,
          dataStream,
          tools: allTools,
          executions: {}
        });

        // Stream the AI response using the configured model
        const result = streamText({
          model,
          system: `${SYSTEM_PROMPT}

${unstable_getSchedulePrompt({ date: new Date() })}`,
          messages: processedMessages,
          tools: allTools,
          temperature: 1,
          onFinish: async (args) => {
            onFinish(
              args as Parameters<StreamTextOnFinishCallback<ToolSet>>[0]
            );
            // await this.mcp.closeConnection(mcpConnection.id);
          },
          onError: (error) => {
            console.error("Error while streaming:", error);
          },
          maxSteps: 10
        });

        // Merge the AI response stream with tool execution outputs
        result.mergeIntoDataStream(dataStream);
      }
    });

    return dataStreamResponse;
  }
  async executeTask(description: string, _task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        content: `Running scheduled task: ${description}`,
        createdAt: new Date()
      }
    ]);
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    // API health check
    if (url.pathname === ROUTES.CHECK_OPENAI_KEY) {
      const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
      return Response.json({
        success: hasOpenAIKey
      });
    }

    // Gmail OAuth routes
    if (url.pathname === ROUTES.OAUTH_CONNECT) {
      return handleGmailOAuthConnect(request, env);
    }

    if (url.pathname === ROUTES.OAUTH_CALLBACK) {
      return handleGmailOAuthCallback(request, env);
    }

    if (url.pathname === ROUTES.OAUTH_STATUS) {
      return handleGmailOAuthStatus(request, env);
    }

    if (url.pathname === ROUTES.OAUTH_DISCONNECT) {
      return handleGmailOAuthDisconnect(request, env);
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error(
        "OPENAI_API_KEY is not set, don't forget to set it locally in .dev.vars, and use `wrangler secret bulk .dev.vars` to upload it to production"
      );
    }
    return (
      // Route the request to our agent or return 404 if not found
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
