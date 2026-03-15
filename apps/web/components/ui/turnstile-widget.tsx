'use client';

import Script from 'next/script';
import { useEffect, useId, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  siteKey: string;
  onTokenChange: (token: string | null) => void;
  resetKey?: number;
};

export function TurnstileWidget({
  siteKey,
  onTokenChange,
  resetKey = 0,
}: TurnstileWidgetProps) {
  const widgetElementId = useId().replace(/:/g, '_');
  const [scriptReady, setScriptReady] = useState(false);
  const [widgetId, setWidgetId] = useState<string | null>(null);

  useEffect(() => {
    if (!scriptReady || !siteKey || !window.turnstile || widgetId) return;

    const renderedWidgetId = window.turnstile.render(`#${widgetElementId}`, {
      sitekey: siteKey,
      theme: 'dark',
      callback: (token) => onTokenChange(token),
      'expired-callback': () => onTokenChange(null),
      'error-callback': () => onTokenChange(null),
    });

    setWidgetId(renderedWidgetId);

    return () => {
      if (renderedWidgetId && window.turnstile) {
        window.turnstile.remove(renderedWidgetId);
      }
    };
  }, [onTokenChange, scriptReady, siteKey, widgetElementId, widgetId]);

  useEffect(() => {
    if (!widgetId || !window.turnstile) return;
    window.turnstile.reset(widgetId);
    onTokenChange(null);
  }, [onTokenChange, resetKey, widgetId]);

  return (
    <div className="space-y-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div
        id={widgetElementId}
        className="min-h-[66px] rounded-2xl border border-line/70 bg-bg/20 p-2"
      />
      <p className="text-xs text-muted">
        Validacao anti-bot do Cloudflare Turnstile.
      </p>
    </div>
  );
}
