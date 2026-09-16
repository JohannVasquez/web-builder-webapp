'use client';

import Script from 'next/script';
import { useCallback, useSyncExternalStore, type ReactElement } from 'react';
import { hasAnyTracker, type AnalyticsConfig } from '../domain/Analytics';
import { Button } from '@/shared/ui/button';

const CONSENT_KEY = 'web-builder.cookie-consent';

type Consent = 'accepted' | 'rejected' | 'unknown';

const listeners = new Set<() => void>();

const readConsent = (): Consent => {
  try {
    const value = globalThis.localStorage?.getItem(CONSENT_KEY);
    return value === 'accepted' || value === 'rejected' ? value : 'unknown';
  } catch {
    return 'unknown';
  }
};

const writeConsent = (value: Consent): void => {
  try {
    globalThis.localStorage?.setItem(CONSENT_KEY, value);
  } catch {
    // Sin almacenamiento la decisión vale para esta visita; preferible a no poder decidir.
  }
  for (const listener of listeners) {
    listener();
  }
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const unknownOnServer = (): Consent => 'unknown';

interface AnalyticsProps {
  readonly config: AnalyticsConfig;
}

export function Analytics({ config }: AnalyticsProps): ReactElement | null {
  const consent = useSyncExternalStore(subscribe, readConsent, unknownOnServer);

  const accept = useCallback(() => writeConsent('accepted'), []);
  const reject = useCallback(() => writeConsent('rejected'), []);

  if (!hasAnyTracker(config)) {
    return null;
  }

  const allowed = config.cookieBannerEnabled ? consent === 'accepted' : true;
  const showBanner = config.cookieBannerEnabled && consent === 'unknown';

  return (
    <>
      {allowed && <Trackers config={config} />}
      {showBanner && (
        <div
          role="dialog"
          aria-label="Aviso de cookies"
          className="ui-card fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 p-4 sm:left-auto sm:max-w-md"
        >
          <p className="text-sm">
            Usamos cookies para entender cómo se navega el sitio y mejorarlo. Puedes
            aceptarlas o seguir sin ellas.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={accept}>
              Aceptar
            </Button>
            <Button size="sm" variant="outline" onClick={reject}>
              Seguir sin cookies
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function Trackers({ config }: AnalyticsProps): ReactElement {
  return (
    <>
      {config.googleTagManagerId !== '' && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${config.googleTagManagerId}');`}
        </Script>
      )}
      {config.googleAnalyticsId !== '' && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${config.googleAnalyticsId}');`}
          </Script>
        </>
      )}
      {config.metaPixelId !== '' && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${config.metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
