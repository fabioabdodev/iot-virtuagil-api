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
  const [scriptReady, setScriptReady] = useState(
    typeof window !== 'undefined' && Boolean(window.turnstile),
  );
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [hasWidgetError, setHasWidgetError] = useState(false);

  useEffect(() => {
    if (!scriptReady || !siteKey || !window.turnstile || widgetId) return;

    let renderedWidgetId: string | null = null;

    try {
      renderedWidgetId = window.turnstile.render(`#${widgetElementId}`, {
        sitekey: siteKey,
        theme: 'dark',
        callback: (token) => onTokenChange(token),
        'expired-callback': () => onTokenChange(null),
        'error-callback': () => onTokenChange(null),
      });

      setWidgetId(renderedWidgetId);
      setHasWidgetError(false);
    } catch {
      setHasWidgetError(true);
      onTokenChange(null);
    }

    return () => {
      if (!renderedWidgetId || !window.turnstile) return;

      try {
        window.turnstile.remove(renderedWidgetId);
      } catch {
        // Ignora erros de limpeza para evitar derrubar a pagina.
      }
    };
  }, [onTokenChange, scriptReady, siteKey, widgetElementId, widgetId]);

  useEffect(() => {
    if (!widgetId || !window.turnstile) return;

    try {
      window.turnstile.reset(widgetId);
      onTokenChange(null);
    } catch {
      setHasWidgetError(true);
      onTokenChange(null);
    }
  }, [onTokenChange, resetKey, widgetId]);

  return (
    <div className="space-y-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => {
          setHasWidgetError(true);
          onTokenChange(null);
        }}
      />
      <div
        id={widgetElementId}
        className="min-h-[66px] rounded-2xl border border-line/70 bg-bg/20 p-2"
      />
      <p className="text-xs text-muted">
        Validacao anti-bot do Cloudflare Turnstile.
      </p>
      {hasWidgetError ? (
        <p className="text-xs text-bad">
          Nao foi possivel carregar a validacao anti-bot agora.
        </p>
      ) : null}
    </div>
  );
}
