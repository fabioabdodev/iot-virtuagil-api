export default function Loading() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-5 px-4 text-center sm:px-6 lg:px-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-line/60 border-t-[hsl(var(--accent))]" />
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
            Virtuagil Monitor
          </p>
          <p className="text-sm text-muted">Carregando dashboard...</p>
        </div>
      </div>
    </main>
  );
}
