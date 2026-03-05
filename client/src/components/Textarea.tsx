import * as React from "react";
import TextareaAutosize, { TextareaAutosizeProps } from "react-textarea-autosize";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaAutosizeProps {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextareaAutosize
        className={cn(
          "flex w-full rounded-xl border border-input bg-transparent px-4 py-3 text-base shadow-sm transition-all duration-300 ease-out",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
