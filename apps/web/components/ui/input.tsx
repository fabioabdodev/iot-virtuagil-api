import { InputHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const fieldClassName =
  'w-full rounded-2xl border border-line/70 bg-bg/40 px-4 py-3 text-sm text-ink outline-none transition placeholder:italic placeholder:text-muted/40 focus:border-accent focus:bg-card/80 disabled:opacity-60';

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn(fieldClassName, className)} {...props} />;
});

Input.displayName = 'Input';

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => {
  return (
    <select ref={ref} className={cn(fieldClassName, className)} {...props} />
  );
});

Select.displayName = 'Select';
