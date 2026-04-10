export function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[520px] overflow-hidden rounded-[32px] border border-[#efd8cb] bg-[radial-gradient(circle_at_top_left,rgba(229,122,65,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(31,132,90,0.12),transparent_28%),linear-gradient(180deg,#fff9f4,#fff1e7)] p-6 shadow-[0_24px_90px_rgba(156,99,56,0.12)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,162,95,0.16),transparent_24%)]" />
      <div className="relative grid h-full gap-4">
        <div className="flex gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e9b08f]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#eedccf]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d8eadf]" />
        </div>

        <div className="grid flex-1 grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="rounded-[24px] border border-[#efd8cb] bg-white/72 p-5">
            <div className="mb-4 h-3 w-24 rounded-full bg-stone-200" />
            <div className="mb-6 space-y-3">
              <div className="h-4 w-4/5 rounded-full bg-[#eab898]" />
              <div className="h-4 w-3/5 rounded-full bg-stone-200" />
            </div>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-[#efe0d5] bg-[#fff7f1] p-4">
                <div className="mb-2 h-3 w-20 rounded-full bg-[#cfe7da]" />
                <div className="h-8 w-24 rounded-2xl bg-[#e7f3ec]" />
              </div>
              <div className="rounded-2xl border border-[#efe0d5] bg-[#fff7f1] p-4">
                <div className="mb-2 h-3 w-16 rounded-full bg-[#f0d7b0]" />
                <div className="h-8 w-28 rounded-2xl bg-[#f9ead0]" />
              </div>
            </div>
          </div>

          <div className="relative rounded-[24px] border border-[#efd8cb] bg-[#fff9f4] p-5">
            <div className="absolute right-5 top-5 h-20 w-20 rounded-full bg-[radial-gradient(circle_at_30%_30%,#e57a41,rgba(229,122,65,0.1))]" />
            <div className="absolute bottom-0 left-1/2 h-36 w-32 -translate-x-1/2 rounded-t-[100px] bg-[#e8f2eb]" />
            <div className="absolute bottom-24 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-[#fff0e5]" />
            <div className="absolute bottom-2 left-4 right-4 rounded-[24px] border border-[#efd8cb] bg-white/85 p-4">
              <div className="mb-2 h-3 w-28 rounded-full bg-stone-200" />
              <div className="h-3 w-20 rounded-full bg-[#eab898]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
