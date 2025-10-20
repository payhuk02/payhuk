import { useEffect } from 'react';

export interface ExternalAnalyticsConfig {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  googleTagManagerId?: string;
  tiktokPixelId?: string;
  pinterestPixelId?: string;
}

export const useExternalAnalytics = (config: ExternalAnalyticsConfig) => {
  useEffect(() => {
    // Google Analytics 4
    if (config.googleAnalyticsId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', config.googleAnalyticsId);
    }

    // Facebook Pixel
    if (config.facebookPixelId) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${config.facebookPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }

    // Google Tag Manager
    if (config.googleTagManagerId) {
      const script = document.createElement('script');
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${config.googleTagManagerId}');
      `;
      document.head.appendChild(script);

      const noscript = document.createElement('noscript');
      noscript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=${config.googleTagManagerId}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `;
      document.body.appendChild(noscript);
    }

    // TikTok Pixel
    if (config.tiktokPixelId) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function (w, d, t) {
          w.TikTokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["track","page","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${config.tiktokPixelId}');
          ttq.page();
        }(window, document, 'ttq');
      `;
      document.head.appendChild(script);
    }

    // Pinterest Pixel
    if (config.pinterestPixelId) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(e){if(!window.pintrk){window.pintrk = function () {
        window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
          n=window.pintrk;n.queue=[],n.version="3.0";var
        t=document.createElement("script");t.async=!0,t.src=e;var
        r=document.getElementsByTagName("script")[0];
        r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct.js");
        pintrk('load', '${config.pinterestPixelId}', {em: 'user_email'});
        pintrk('page');
      `;
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Remove scripts on cleanup
      const scripts = document.querySelectorAll('script[src*="googletagmanager"], script[src*="fbevents"], script[src*="gtm.js"], script[src*="pinimg.com"], script[src*="tiktok"]');
      scripts.forEach(script => script.remove());
      
      // Remove noscript tags
      const noscripts = document.querySelectorAll('noscript');
      noscripts.forEach(noscript => noscript.remove());
    };
  }, [config]);

  // Track events for external analytics
  const trackEvent = (eventName: string, eventData: any = {}) => {
    // Google Analytics
    if (config.googleAnalyticsId && window.gtag) {
      window.gtag('event', eventName, eventData);
    }

    // Facebook Pixel
    if (config.facebookPixelId && window.fbq) {
      window.fbq('track', eventName, eventData);
    }

    // Google Tag Manager
    if (config.googleTagManagerId && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...eventData
      });
    }

    // TikTok Pixel
    if (config.tiktokPixelId && window.ttq) {
      window.ttq.track(eventName, eventData);
    }

    // Pinterest Pixel
    if (config.pinterestPixelId && window.pintrk) {
      window.pintrk('track', eventName, eventData);
    }
  };

  return { trackEvent };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    ttq: any;
    pintrk: (...args: any[]) => void;
  }
}
