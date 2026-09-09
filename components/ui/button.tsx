import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const BRAND_GRADIENT = "linear-gradient(135deg, #c0392b, #922b21)";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-white shadow-sm hover:opacity-90 transition-opacity",
        brand: "text-white shadow-sm hover:opacity-90 transition-opacity",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        outline:
          "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-gray-200 dark:hover:bg-neutral-800",
        secondary:
          "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-gray-200 dark:hover:bg-neutral-800",
        ghost: "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-neutral-800",
        link: "text-red-700 underline-offset-4 hover:underline dark:text-red-400",
      },
      size: {
        default: "h-10 px-4 py-2.5",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isBrand = variant === "default" || variant === "brand" || variant === undefined;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={isBrand ? { background: BRAND_GRADIENT, ...style } : style}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
