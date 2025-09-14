import { EmailCard } from "./EmailCard";
import type { EmailContent } from "@/types";

interface EmailListProps {
  emails: EmailContent[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
  onReply?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  maxItems?: number;
}

export function EmailList({
  emails,
  title,
  subtitle,
  compact = false,
  onReply,
  onForward,
  onDelete,
  maxItems
}: EmailListProps) {
  const displayEmails = maxItems ? emails.slice(0, maxItems) : emails;
  const hasMore = maxItems && emails.length > maxItems;

  if (emails.length === 0) {
    return null; // Don't show anything if no emails
  }

  return (
    <div className="max-w-[700px]">
      <div className={`space-y-${compact ? "2" : "4"}`}>
        {displayEmails.map((email) => (
          <EmailCard
            key={email.id}
            email={email}
            compact={compact}
            onReply={onReply}
            onForward={onForward}
            onDelete={onDelete}
          />
        ))}
      </div>

      {hasMore && (
        <div className="text-center py-4">
          <p className="text-sm text-neutral-500">
            Showing {maxItems} of {emails.length} emails
          </p>
        </div>
      )}
    </div>
  );
}
