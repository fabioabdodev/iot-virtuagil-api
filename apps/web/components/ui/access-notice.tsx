'use client';

import { ReactNode } from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Feedback } from '@/components/ui/feedback';
import { Panel } from '@/components/ui/panel';

type AccessNoticeProps = {
  title: string;
  description: string;
  tone?: 'neutral' | 'warning';
  badge?: string;
  hint?: ReactNode;
};

export function AccessNotice({
  title,
  description,
  tone = 'neutral',
  badge,
  hint,
}: AccessNoticeProps) {
  const Icon = tone === 'warning' ? ShieldAlert : Lock;

  return (
    <Panel className="animate-fade-up p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Acesso e contrato
          </p>
          <h2 className="mt-1 text-lg font-semibold">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
        </div>
        <Badge>
          <Icon className="h-3.5 w-3.5 text-accent" />
          {badge ?? 'restrito'}
        </Badge>
      </div>

      {hint ? <Feedback>{hint}</Feedback> : null}
    </Panel>
  );
}
