import { HTMLAttributes, ReactNode } from 'react';
import { Panel } from '@/components/ui/panel';
import { cn } from '@/lib/utils';

type MetricCardProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  accentClassName?: string;
};

export function MetricCard({
  title,
  value,
  icon,
  accentClassName,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Panel className={cn('relative overflow-hidden p-5', className)} {...props}>
      <div
        className={cn(
          'absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl',
          accentClassName,
        )}
      />
      <p className="mb-2 text-sm text-muted">{title}</p>
      <div className="text-3xl font-semibold">{value}</div>
      {icon ? <div className="mt-4">{icon}</div> : null}
    </Panel>
  );
}
