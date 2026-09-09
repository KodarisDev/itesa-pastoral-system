import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[90px] w-full rounded-xl border bg-white px-3 py-2.5 text-[16px] text-gray-700 outline-none transition-colors duration-300 dark:bg-neutral-900 dark:text-gray-200 md:text-sm",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "disabled:cursor-not-allowed disabled:opacity-60",
          invalid
            ? "border-red-300 focus:border-red-500 dark:border-red-800"
            : "border-gray-200 focus:border-red-400 dark:border-neutral-700 dark:focus:border-red-600",
          className,
        )}
        aria-invalid={invalid || undefined}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
