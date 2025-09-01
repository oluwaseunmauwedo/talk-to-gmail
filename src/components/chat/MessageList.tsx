import type { Message } from "@ai-sdk/react";
import type { ToolName } from "@/tools";
import { Card } from "@/components/card/Card";
import { Avatar } from "@/components/avatar/Avatar";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { ToolInvocationCard } from "@/components/tool-invocation-card/ToolInvocationCard";
import { TOOLS_REQUIRING_CONFIRMATION } from "@/constants";

interface MessageListProps {
  messages: Message[];
  showDebug: boolean;
  addToolResult: (args: { toolCallId: string; result: any }) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

                        return (
                          <ToolInvocationCard
                            key={`${toolCallId}-${i}`}
                            toolInvocation={toolInvocation}
                            toolCallId={toolCallId}
                            needsConfirmation={needsConfirmation}
                            addToolResult={addToolResult}
                          />
                        );
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
