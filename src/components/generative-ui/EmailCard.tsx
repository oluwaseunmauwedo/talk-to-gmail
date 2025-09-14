import { Card } from "@/components/card/Card";
import { Avatar } from "@/components/avatar/Avatar";
import { Button } from "@/components/button/Button";
import type { EmailContent } from "@/types";
import { useRef, useEffect } from "react";

// Component to safely render HTML email content using Shadow DOM
function SafeHtmlRenderer({ htmlContent }: { htmlContent: string }) {
  const shadowHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shadowHostRef.current) return;

    // Create shadow DOM
    const shadowRoot = shadowHostRef.current.attachShadow({ mode: 'open' });
    
    // Create a container for the HTML content
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    
    // Add some basic styles to make the content readable
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body, html {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.5;
        color: #333;
        background: transparent;
      }
      p, div, span {
        margin-bottom: 8px;
      }
      img {
        max-width: 100%;
        height: auto;
      }
      table {
        border-collapse: collapse;
        width: 100%;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      a {
        color: #0066cc;
        text-decoration: underline;
      }
      blockquote {
        border-left: 4px solid #ddd;
        margin: 0;
        padding-left: 16px;
        font-style: italic;
      }
      code {
        background: #f5f5f5;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: monospace;
      }
      pre {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 4px;
        overflow-x: auto;
        font-family: monospace;
      }
    `;
    
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(container);

    // Cleanup function
    return () => {
      if (shadowRoot) {
        shadowRoot.innerHTML = '';
      }
    };
  }, [htmlContent]);

  return <div ref={shadowHostRef} className="w-full" />;
}

interface EmailCardProps {
  email: EmailContent;
  onReply?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  compact?: boolean;
}

export function EmailCard({
  email,
  onReply,
  onForward,
  onDelete,
  compact = false
}: EmailCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        });
      } else if (diffInHours < 24 * 7) {
        return date.toLocaleDateString([], {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit"
        });
      } else {
        return date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric"
        });
      }
    } catch {
      return dateString;
    }
  };

  const extractSenderName = (from: string) => {
    const match = from.match(/^(.+?)\s*<.*>$/) || from.match(/^(.+)$/);
    return match ? match[1].trim().replace(/^"(.*)"$/, "$1") : from;
  };

  const extractSenderEmail = (from: string) => {
    const match = from.match(/<(.+?)>/);
    return match ? match[1] : from;
  };

  const senderName = extractSenderName(email.from);
  const senderEmail = extractSenderEmail(email.from);

  if (compact) {
    return (
      <Card className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-start gap-3">
          <Avatar
            username={senderName}
            image={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(senderName)}`}
            className="w-8 h-8 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm truncate">{senderName}</span>
              <span className="text-xs text-neutral-500 flex-shrink-0">
                {formatDate(email.date)}
              </span>
            </div>
            <h3 className="font-semibold text-sm mt-1 truncate">
              {email.subject}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
              {email.snippet || (email.isHtml ? 
                email.htmlBody?.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 
                email.body?.substring(0, 100) + '...'
              )}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
      <div className="flex items-start gap-4">
        <Avatar
          username={senderName}
          image={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(senderName)}`}
          className="w-10 h-10 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg mb-1">{email.subject}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-medium">{senderName}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-xs sm:text-sm">{senderEmail}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className="text-sm text-neutral-500">
                {formatDate(email.date)}
              </span>
              <div className="flex gap-1">
                {onReply && (
                  <Button
                    onClick={() => onReply(email.id)}
                    className="px-2 py-1 text-xs"
                    variant="secondary"
                  >
                    Reply
                  </Button>
                )}
                {onForward && (
                  <Button
                    onClick={() => onForward(email.id)}
                    className="px-2 py-1 text-xs"
                    variant="secondary"
                  >
                    Forward
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={() => onDelete(email.id)}
                    className="px-2 py-1 text-xs"
                    variant="destructive"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 mt-3">
              {email.isHtml && email.htmlBody ? (
                <SafeHtmlRenderer htmlContent={email.htmlBody} />
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {email.body || email.snippet}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <span className="text-xs text-neutral-500 font-mono">
              ID: {email.id}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
