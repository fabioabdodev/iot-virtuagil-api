type CardBrandsProps = {
  className?: string;
  compact?: boolean;
};

export function CardBrands({ className = '', compact = false }: CardBrandsProps) {
  const base =
    'inline-flex h-7 min-w-10 items-center justify-center rounded-md border border-white/15 bg-white px-2 text-[9px] font-black tracking-[-0.02em] shadow-sm';

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`} aria-label="Bandeiras aceitas no checkout">
      <span className={base + ' text-[#1434CB]'}>VISA</span>
      <span className={base + ' gap-0 px-2'} aria-label="Mastercard">
        <span className="h-3.5 w-3.5 rounded-full bg-[#EB001B]" />
        <span className="-ml-1.5 h-3.5 w-3.5 rounded-full bg-[#F79E1B] opacity-90" />
      </span>
      <span className={base + ' text-[#006FCF]'}>AMEX</span>
      {!compact ? (
        <>
          <span className={base + ' text-[#111827]'}>ELO</span>
          <span className={base + ' text-[#B5121B]'}>HIPER</span>
        </>
      ) : null}
      <span className="inline-flex h-7 items-center justify-center rounded-md border border-emerald-300/25 bg-emerald-300/[0.08] px-2 text-[9px] font-black text-emerald-200">
        PIX
      </span>
    </div>
  );
}
