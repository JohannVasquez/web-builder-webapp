'use client';

import Script from 'next/script';
import type { ReactElement } from 'react';
import { hasAnyTracker, type AnalyticsConfig } from '../domain/Analytics';
import { useConsent } from '@/modules/Consent/presentation/ConsentProvider';

interface AnalyticsProps {
  readonly config: AnalyticsConfig;
}

/**
 * Ningún rastreador carga sin permiso de SU finalidad. Medir y perfilar para publicidad son
 * finalidades distintas: aceptar la primera no autoriza la segunda.
 *
 * Google Tag Manager es un contenedor —puede cargar cualquier cosa, incluida publicidad— así
 * que se trata como publicidad y no como medición.
 */
export function Analytics({ config }: AnalyticsProps): ReactElement | null {
  const { allows } = useConsent();

  if (!hasAnyTracker(config)) {
    return null;
  }

  const analytics = allows('analytics');
  const advertising = allows('advertising');

  return (
    <>
      {analytics && config.googleAnalyticsId !== '' && (
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
      {advertising && config.googleTagManagerId !== '' && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${config.googleTagManagerId}');`}
        </Script>
      )}
      {advertising && config.metaPixelId !== '' && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${config.metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
