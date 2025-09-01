import { Textarea } from "@/components/textarea/Textarea";
import { PaperPlaneTiltIcon, StopIcon } from "@phosphor-icons/react";

interface ChatInputProps {
  agentInput: string;
  handleAgentInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleAgentSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  stop: () => void;
  pendingToolCallConfirmation: boolean;
  textareaHeight: string;
  setTextareaHeight: (height: string) => void;
}

export function ChatInput({
  agentInput,
  handleAgentInputChange,
  handleAgentSubmit,
  isLoading,
  stop,
  pendingToolCallConfirmation,
  textareaHeight,
  setTextareaHeight
}: ChatInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleAgentSubmit(e);
        setTextareaHeight("auto"); // Reset height after submission
      }}
      className="p-3 bg-neutral-50 absolute bottom-0 left-0 right-0 z-10 border-t border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Textarea
            disabled={pendingToolCallConfirmation}
            placeholder={
              pendingToolCallConfirmation
                ? "Please respond to the tool confirmation above..."
                : "Send a message..."
            }
            className="flex w-full border border-neutral-200 dark:border-neutral-700 px-3 py-2  ring-offset-background placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-xl !text-base pb-10 dark:bg-neutral-900"
            value={agentInput}
            onChange={(e) => {
              handleAgentInputChange(e);
              // Auto-resize the textarea
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
              setTextareaHeight(`${e.target.scrollHeight}px`);
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                handleAgentSubmit(e as unknown as React.FormEvent);
                setTextareaHeight("auto"); // Reset height on Enter submission
              }
            }}
            rows={2}
            style={{ height: textareaHeight }}
          />
          <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-1.5 h-fit border border-neutral-200 dark:border-neutral-800"
                aria-label="Stop generation"
              >
                <StopIcon weight="duotone" size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-1.5 h-fit border border-neutral-200 dark:border-neutral-800"
                disabled={pendingToolCallConfirmation || !agentInput.trim()}
                aria-label="Send message"
              >
                <PaperPlaneTiltIcon weight="duotone" size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
