const CROSS_SELL_PRIORITY_BY_MODULE: Record<string, string[]> = {
  ambiental: ['energia', 'acionamento'],
  energia: ['ambiental', 'acionamento'],
  acionamento: ['ambiental', 'energia'],
};

const DEFAULT_CROSS_SELL_PRIORITY = ['ambiental', 'energia', 'acionamento'];

export function selectCrossSellModule(activeModules: string[]): string | null {
  const normalized = Array.from(
    new Set(
      activeModules
        .filter((moduleKey) => typeof moduleKey === 'string' && moduleKey.trim().length > 0)
        .map((moduleKey) => moduleKey.trim().toLowerCase()),
    ),
  );

  if (normalized.length === 0) {
    return DEFAULT_CROSS_SELL_PRIORITY[0] ?? null;
  }

  const missingFromPriority = normalized.flatMap(
    (moduleKey) => CROSS_SELL_PRIORITY_BY_MODULE[moduleKey] ?? [],
  );

  for (const candidate of missingFromPriority) {
    if (!normalized.includes(candidate)) {
      return candidate;
    }
  }

  for (const candidate of DEFAULT_CROSS_SELL_PRIORITY) {
    if (!normalized.includes(candidate)) {
      return candidate;
    }
  }

  return null;
}
