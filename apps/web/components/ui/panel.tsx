import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const panelVariants = cva(
  'border border-line/70 shadow-lift backdrop-blur-xl',
  {
    variants: {
      variant: {
        default: 'rounded-[24px] bg-card/60',
        strong:
          'rounded-[28px] bg-[linear-gradient(180deg,color-mix(in_srgb,hsl(var(--card-strong))_92%,#000_8%),color-mix(in_srgb,hsl(var(--card))_88%,#000_12%))]',
        shell: 'relative overflow-hidden rounded-[28px] bg-card/65',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type PanelProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof panelVariants>;

export function Panel({ className, variant, ...props }: PanelProps) {
  return <div className={cn(panelVariants({ variant }), className)} {...props} />;
}
