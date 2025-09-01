import { memo } from "react";
import { Streamdown } from "streamdown";

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    return (
      <Streamdown
        key={id}
        parseIncompleteMarkdown={true}
        className="streamdown-content"
      >
        {content}
      </Streamdown>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
