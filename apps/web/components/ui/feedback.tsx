import { HTMLAttributes } from 'react';
import { Check, Info, X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const feedbackVariants = cva('rounded-2xl border px-4 py-3 text-sm shadow-[0_10px_30px_rgba(0,0,0,0.12)]', {
  variants: {
    variant: {
      neutral: 'border-line/70 bg-card/70 text-ink',
      danger: 'border-bad/50 bg-bad/15 text-bad',
      success: 'border-ok/50 bg-ok/15 text-ok',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

type FeedbackProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof feedbackVariants>;

export function Feedback({ className, variant, children, ...props }: FeedbackProps) {
  const Icon =
    variant === 'success'
      ? Check
      : variant === 'danger'
        ? X
        : Info;

  return (
    <div className={cn(feedbackVariants({ variant }), className)} {...props}>
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
