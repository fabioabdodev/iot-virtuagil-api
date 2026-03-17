'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Panel } from '@/components/ui/panel';

type AccordionPanelProps = {
  title: string;
  description?: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

export function AccordionPanel({
  title,
  description,
  badge,
  defaultOpen = true,
  className,
  bodyClassName,
  children,
}: AccordionPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Panel className={cn('overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-white/5 sm:px-5"
        aria-expanded={isOpen}
      >
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink sm:text-lg">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted">{description}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {badge ? <div className="shrink-0">{badge}</div> : null}
          <ChevronDown
            className={cn(
              'h-5 w-5 shrink-0 text-muted transition-transform',
              isOpen ? 'rotate-180' : '',
            )}
          />
        </div>
      </button>

      {isOpen ? (
        <div className={cn('border-t border-line/60 px-4 py-4 sm:px-5', bodyClassName)}>
          {children}
        </div>
      ) : null}
    </Panel>
  );
}
