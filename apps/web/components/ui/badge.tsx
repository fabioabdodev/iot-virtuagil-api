import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs',
  {
    variants: {
      variant: {
        neutral: 'border-line/70 bg-card/70 text-muted',
        success: 'border-ok/30 bg-ok/10 text-ok',
        danger: 'border-bad/30 bg-bad/10 text-bad',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
