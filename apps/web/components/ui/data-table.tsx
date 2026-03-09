import { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function DataTableWrapper({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-[24px] border border-line/70 bg-bg/10',
        className,
      )}
      {...props}
    />
  );
}

export function DataTable({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('data-table', className)} {...props} />;
}

export function DataTableHeadCell({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn(className)} {...props} />;
}
