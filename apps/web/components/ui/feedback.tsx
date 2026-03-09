import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const feedbackVariants = cva('rounded-2xl border px-4 py-3 text-sm', {
  variants: {
    variant: {
      neutral: 'border-line/70 bg-card/50 text-muted',
      danger: 'border-bad/30 bg-bad/10 text-bad',
      success: 'border-ok/30 bg-ok/10 text-ok',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

type FeedbackProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof feedbackVariants>;

export function Feedback({ className, variant, ...props }: FeedbackProps) {
  return (
    <div className={cn(feedbackVariants({ variant }), className)} {...props} />
  );
}
