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
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📧</div>
        <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          No emails found
        </h3>
        <p className="text-sm text-neutral-500">
          {title ? `No emails match your criteria.` : `Your inbox is empty.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(title || subtitle) && (
        <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
          {title && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📧</span>
              <h2 className="text-xl font-semibold">{title}</h2>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                {emails.length}
              </span>
            </div>
          )}
          {subtitle && (
            <p className="text-neutral-600 dark:text-neutral-400">{subtitle}</p>
          )}
        </div>
      )}

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
