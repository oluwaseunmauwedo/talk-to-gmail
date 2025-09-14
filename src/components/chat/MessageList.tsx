import type { Message } from "@ai-sdk/react";
import type { ToolName } from "@/tools";
import { Card } from "@/components/card/Card";
import { Avatar } from "@/components/avatar/Avatar";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { ToolInvocationCard } from "@/components/tool-invocation-card/ToolInvocationCard";
import { TOOLS_REQUIRING_CONFIRMATION } from "@/constants";

// Import generative UI components
import { EmailList, EventList } from "@/components/generative-ui";

interface MessageListProps {
  messages: Message[];
  showDebug: boolean;
  addToolResult: (args: { toolCallId: string; result: any }) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Import types for proper typing
import type { EmailContent } from "@/types";
import type { CalendarEvent } from "@/tools/calendar/types";

// Type for generative UI results
interface GenerativeUIResult {
  type: "emails" | "events" | "email_detail" | "event_detail" | "error";
  emails?: EmailContent[];
  events?: CalendarEvent[];
  email?: EmailContent;
  event?: CalendarEvent;
  title?: string;
  subtitle?: string;
  message?: string;
  compact?: boolean;
  maxItems?: number;
  groupByDate?: boolean;
}

// Function to check if a tool result contains generative UI data
function isGenerativeUIResult(result: unknown): result is GenerativeUIResult {
  if (result === null || typeof result !== "object" || !("type" in result)) {
    return false;
  }
  
  const resultObj = result as Record<string, unknown>;
  return (
    typeof resultObj.type === "string" &&
    ["emails", "events", "email_detail", "event_detail", "error"].includes(
      resultObj.type,
    )
  );
}

// Function to render generative UI components based on tool results
function renderGenerativeUI(result: GenerativeUIResult, key: string) {
  if (!isGenerativeUIResult(result)) return null;

  switch (result.type) {
    case "emails":
      return (
        <div key={key} className="my-4">
          <EmailList
            emails={result.emails || []}
            title={result.title}
            subtitle={result.subtitle}
            compact={result.compact}
            maxItems={result.maxItems}
          />
        </div>
      );

    case "email_detail":
      return result.email ? (
        <div key={key} className="my-4">
          <EmailList
            emails={[result.email]}
            title={result.title}
            compact={false}
          />
        </div>
      ) : null;

    case "events":
      return (
        <div key={key} className="my-4">
          <EventList
            events={result.events || []}
            title={result.title}
            subtitle={result.subtitle}
            compact={result.compact}
            maxItems={result.maxItems}
            groupByDate={result.groupByDate}
          />
        </div>
      );

    case "event_detail":
      return result.event ? (
        <div key={key} className="my-4">
          <EventList
            events={[result.event]}
            title={result.title}
            compact={false}
          />
        </div>
      ) : null;

    case "error":
      return (
        <div key={key} className="my-4">
          <Card className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error
                </h3>
                <p className="text-red-700 dark:text-red-300">
                  {result.message}
                </p>
              </div>
            </div>
          </Card>
        </div>
      );

    default:
      return null;
  }
}

export function MessageList({
  messages,
  showDebug,
  addToolResult,
  messagesEndRef
}: MessageListProps) {
  return (
    <>
      {messages.map((m: Message, index) => {
        const isUser = m.role === "user";
        const showAvatar = index === 0 || messages[index - 1]?.role !== m.role;

        return (
          <div key={m.id}>
            {showDebug && (
              <pre className="text-xs text-muted-foreground overflow-scroll">
                {JSON.stringify(m, null, 2)}
              </pre>
            )}
            <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex gap-2 max-w-[85%] ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {showAvatar && !isUser ? (
                  <Avatar
                    username={"AI"}
                    image="https://api.dicebear.com/9.x/glass/svg?seed=Jude"
                    className="flex-shrink-0"
                  />
                ) : (
                  !isUser && <div className="w-8" />
                )}

                <div>
                  <div>
                    {m.parts?.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          // biome-ignore lint/suspicious/noArrayIndexKey: immutable index
                          <div key={i}>
                            <Card
                              className={`p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 ${
                                isUser
                                  ? "rounded-br-none"
                                  : "rounded-bl-none border-assistant-border"
                              } ${
                                part.text.startsWith("scheduled message")
                                  ? "border-accent/50"
                                  : ""
                              } relative`}
                            >
                              {part.text.startsWith("scheduled message") && (
                                <span className="absolute -top-3 -left-2 text-base">
                                  🕒
                                </span>
                              )}
                              <MemoizedMarkdown
                                id={`${m.id}-${i}`}
                                content={part.text.replace(
                                  /^scheduled message: /,
                                  ""
                                )}
                              />
                            </Card>
                            <p
                              className={`text-xs text-muted-foreground mt-1 ${
                                isUser ? "text-right" : "text-left"
                              }`}
                            >
                              {formatTime(
                                new Date(m.createdAt as unknown as string)
                              )}
                            </p>
                          </div>
                        );
                      }

                      if (part.type === "tool-invocation") {
                        const toolInvocation = part.toolInvocation;
                        const toolCallId = toolInvocation.toolCallId;
                        const needsConfirmation =
                          TOOLS_REQUIRING_CONFIRMATION.includes(
                            toolInvocation.toolName as ToolName
                          );

                        // Skip rendering the card in debug mode
                        if (showDebug) return null;

                        // Always render the tool invocation card for visibility
                        const toolCard = (
                          <ToolInvocationCard
                            key={`${toolCallId}-${i}`}
                            toolInvocation={toolInvocation}
                            toolCallId={toolCallId}
                            needsConfirmation={needsConfirmation}
                            addToolResult={addToolResult}
                          />
                        );

                        // If tool has completed and returned generative UI data, show both
                        if (
                          toolInvocation.state === "result" &&
                          !needsConfirmation &&
                          isGenerativeUIResult(toolInvocation.result)
                        ) {
                          return (
                            <div key={`${toolCallId}-${i}-container`} className="space-y-2">
                              {toolCard}
                              {renderGenerativeUI(
                                toolInvocation.result,
                                `${toolCallId}-${i}-genui`
                              )}
                            </div>
                          );
                        }

                        // Otherwise, just show the tool invocation card
                        return toolCard;
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </>
  );
}
