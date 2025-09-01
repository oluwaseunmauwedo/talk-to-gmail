import { Button } from "@/components/button/Button";
import { SUGGESTED_QUESTIONS } from "@/constants";
import type { GmailConnectionStatus } from "@/types";

interface SuggestedQuestionsProps {
  gmailStatus: GmailConnectionStatus;
  onQuestionClick: (
    question: string,
    gmailStatus: GmailConnectionStatus
  ) => void;
}

export function SuggestedQuestions({
  gmailStatus,
  onQuestionClick
}: SuggestedQuestionsProps) {
  return (
    <div className="h-full flex items-end justify-center">
      <div className="py-6 flex flex-wrap gap-3 w-full">
        {SUGGESTED_QUESTIONS.map((question) => (
          <Button
            key={question}
            variant="secondary"
            onClick={() => onQuestionClick(question, gmailStatus)}
            disabled={!gmailStatus.connected}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
