import { use } from "react";

// Custom hooks
import { useTheme } from "@/hooks/useTheme";
import { useGmailConnection } from "@/hooks/useGmailConnection";
import { useChatInterface } from "@/hooks/useChatInterface";

// Components
import { ChatHeader } from "@/components/chat/ChatHeader";
import { SuggestedQuestions } from "@/components/chat/SuggestedQuestions";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";

// Routes
import { ROUTES } from "@/constants";

export default function Chat() {
  // Custom hooks
  const { theme, toggleTheme } = useTheme();
  const { gmailStatus, connectGmail, disconnectGmail } = useGmailConnection();
  const {
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
  } = useChatInterface();

  return (
    <div className="h-dvh w-full flex justify-center items-center bg-fixed overflow-hidden">
      <HasOpenAIKey />
      <div className="h-dvh w-full flex flex-col shadow-xl rounded-md overflow-hidden relative border border-neutral-300 dark:border-neutral-800">
        <ChatHeader
          gmailStatus={gmailStatus}
          connectGmail={connectGmail}
          disconnectGmail={disconnectGmail}
          theme={theme}
          toggleTheme={toggleTheme}
          showDebug={showDebug}
          setShowDebug={setShowDebug}
          clearHistory={clearHistory}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-11rem)] p-4">
          {agentMessages.length === 0 && (
            <SuggestedQuestions
              gmailStatus={gmailStatus}
              onQuestionClick={handleSuggestedQuestion}
            />
          )}

          <MessageList
            messages={agentMessages}
            showDebug={showDebug}
            addToolResult={addToolResult}
            messagesEndRef={messagesEndRef}
          />
        </div>

        <ChatInput
          agentInput={agentInput}
          handleAgentInputChange={handleAgentInputChange}
          handleAgentSubmit={handleAgentSubmit}
          isLoading={isLoading}
          stop={stop}
          pendingToolCallConfirmation={pendingToolCallConfirmation}
          textareaHeight={textareaHeight}
          setTextareaHeight={setTextareaHeight}
        />
      </div>
    </div>
  );
}

const hasOpenAiKeyPromise = fetch(ROUTES.CHECK_OPENAI_KEY).then((res) =>
  res.json<{ success: boolean }>()
);

function HasOpenAIKey() {
  const hasOpenAiKey = use(hasOpenAiKeyPromise);

  if (!hasOpenAiKey.success) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/10 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-red-200 dark:border-red-900 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-labelledby="warningIcon"
                >
                  <title id="warningIcon">Warning Icon</title>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  OpenAI API Key Not Configured
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 mb-1">
                  Requests to the API, including from the frontend UI, will not
                  work until an OpenAI API key is configured.
                </p>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Please configure an OpenAI API key by setting a{" "}
                  <a
                    href="https://developers.cloudflare.com/workers/configuration/secrets/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 dark:text-red-400"
                  >
                    secret
                  </a>{" "}
                  named{" "}
                  <code className="bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded text-red-600 dark:text-red-400 font-mono text-sm">
                    OPENAI_API_KEY
                  </code>
                  . <br />
                  You can also use a different model provider by following these{" "}
                  <a
                    href="https://github.com/cloudflare/agents-starter?tab=readme-ov-file#use-a-different-ai-model-provider"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 dark:text-red-400"
                  >
                    instructions.
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
