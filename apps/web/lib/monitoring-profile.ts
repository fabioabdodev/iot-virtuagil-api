export function formatMonitoringInterval(seconds?: number | null) {
  if (seconds == null) return 'Herdado';
  if (seconds < 60) return `${seconds}s`;
  if (seconds % 3600 === 0) return `${seconds / 3600}h`;
  if (seconds % 60 === 0) return `${seconds / 60} min`;
  return `${seconds}s`;
}

export function formatOfflineAlertDelay(minutes?: number | null) {
  if (minutes == null) return 'Herdado';
  if (minutes >= 1440 && minutes % 1440 === 0) return `${minutes / 1440} dia(s)`;
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60}h`;
  return `${minutes} min`;
}

export function describeMonitoringTier(seconds?: number | null) {
  if (seconds == null) return 'Herda a cadencia da conta';
  if (seconds <= 30) return 'Critico';
  if (seconds <= 60) return 'Rapido';
  if (seconds <= 300) return 'Padrao';
  if (seconds <= 3600) return 'Economico';
  return 'Baixa frequencia';
}
