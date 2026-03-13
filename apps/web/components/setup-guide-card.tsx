'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, ClipboardList, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';

type Step = {
  title: string;
  description: string;
  done?: boolean;
};

type SetupGuideCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  steps: Step[];
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function SetupGuideCard({
  eyebrow,
  title,
  description,
  steps,
  primaryActionLabel,
  onPrimaryAction,
  secondaryHref,
  secondaryLabel,
}: SetupGuideCardProps) {
  return (
    <Panel variant="strong" className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-lg font-semibold">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
        </div>
        <Badge>
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          onboarding
        </Badge>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.title}
            className="flex gap-3 rounded-2xl border border-line/70 bg-bg/30 p-3"
          >
            <div className="pt-0.5">
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 text-ok" />
              ) : (
                <ClipboardList className="h-4 w-4 text-accent" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{step.title}</p>
              <p className="mt-1 text-xs text-muted">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {primaryActionLabel && onPrimaryAction ? (
          <Button onClick={onPrimaryAction} variant="primary">
            {primaryActionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : null}

        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="btn-secondary px-4 py-3 text-sm font-semibold"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </Panel>
  );
}
