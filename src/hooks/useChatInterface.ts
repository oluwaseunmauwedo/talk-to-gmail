import { useRef, useCallback, useEffect, useState } from "react";
import { useAgent } from "agents/react";
import { useAgentChat } from "agents/ai-react";
import type { Message } from "@ai-sdk/react";
import type { GmailConnectionStatus } from "@/types";
import { TOOLS_REQUIRING_CONFIRMATION } from "@/constants";
import type { ToolName } from "@/tools";

export function useChatInterface() {
  const [showDebug, setShowDebug] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState("auto");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const agent = useAgent({
    agent: "chat"
  });

  const {
    messages: agentMessages,
    input: agentInput,
    handleInputChange: handleAgentInputChange,
    handleSubmit: handleAgentSubmit,
    addToolResult,
    clearHistory,
    isLoading,
    stop
  } = useAgentChat({
    agent,
    maxSteps: 5
  });

  const handleSuggestedQuestion = useCallback(
    (question: string, gmailStatus: GmailConnectionStatus) => {
      if (!gmailStatus.connected) return;

      // Simulate typing the question and submitting
      const event = new Event("submit", { bubbles: true, cancelable: true });
      handleAgentInputChange({ target: { value: question } } as any);
      setTimeout(() => {
        handleAgentSubmit(event as any);
      }, 100);
    },
    [handleAgentInputChange, handleAgentSubmit]
  );

  useEffect(() => {
    if (agentMessages.length > 0) {
      scrollToBottom();
    }
  }, [agentMessages, scrollToBottom]);

  // Scroll to bottom on mount
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const pendingToolCallConfirmation = agentMessages.some((m: Message) =>
    m.parts?.some(
      (part) =>
        part.type === "tool-invocation" &&
        part.toolInvocation.state === "call" &&
        TOOLS_REQUIRING_CONFIRMATION.includes(
          part.toolInvocation.toolName as ToolName
        )
    )
  );

  return {
    showDebug,
    setShowDebug,
    textareaHeight,
    setTextareaHeight,

    agentMessages,
    agentInput,
    handleAgentInputChange,
    handleAgentSubmit,
    addToolResult,
    clearHistory,
    isLoading,
    stop,

    handleSuggestedQuestion,
    pendingToolCallConfirmation,
    messagesEndRef
  };
}
