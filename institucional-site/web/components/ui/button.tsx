import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[linear-gradient(135deg,#1f8f66_0%,#1a6f52_100%)] text-white shadow-[0_18px_45px_rgba(9,47,34,0.42)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_24px_60px_rgba(10,60,42,0.52)]',
        secondary:
          'border border-[#2f7058]/70 bg-[rgba(17,34,28,0.6)] text-[#d8f8ea] shadow-[0_14px_30px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:border-[#58c19a]/70 hover:bg-[rgba(25,54,43,0.72)]',
        ghost: 'text-[#dcf7eb] hover:bg-[rgba(26,70,54,0.25)]',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-5 text-sm',
        lg: 'h-14 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
