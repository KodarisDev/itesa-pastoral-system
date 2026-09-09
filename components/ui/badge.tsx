import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors duration-300 focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300",
        secondary: "border-transparent bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300",
        outline: "border-gray-300 bg-transparent text-gray-600 dark:border-neutral-600 dark:text-gray-400",
        success:
          "border-green-200 bg-green-100 text-green-700 dark:border-green-800/50 dark:bg-green-900/30 dark:text-green-400",
        warning:
          "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-400",
        destructive: "border-red-200 bg-red-100 text-red-700 dark:border-red-800/50 dark:bg-red-900/30 dark:text-red-400",
        info: "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-400",
        brand: "border-transparent bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
