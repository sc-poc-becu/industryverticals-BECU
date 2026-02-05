import { useEffect, JSX } from 'react';
import { CloudSDK } from '@sitecore-cloudsdk/core/browser';
import { SitecorePageProps } from '@sitecore-content-sdk/nextjs';
import '@sitecore-cloudsdk/events/browser';
import '@sitecore-cloudsdk/personalize/browser';
import config from 'sitecore.config';

/**
 * The Bootstrap component is the entry point for performing any initialization logic
 * that needs to happen early in the application's lifecycle.
 */
/**
 * Engage initialization settings for the Sitecore Engage SDK.
 */
type EngageSettings = {
  clientKey: string;
  targetURL: string;
  pointOfSale: string;
  cookieDomain: string;
  cookieExpiryDays: number;
  webPersonalization: string;
};

/**
 * Engage SDK instance interface for page view tracking.
 */
type EngageInstance = {
  pageView: (payload: {
    channel: string;
    language: string;
    currency: string;
    page: string;
  }) => Promise<void> | void;
};

/**
 * Engage SDK interface.
 */
type EngageSdk = {
  init: (settings: EngageSettings) => Promise<EngageInstance>;
};
const Bootstrap = (props: SitecorePageProps): JSX.Element | null => {
  const { page } = props;

  // Browser ClientSDK init allows for page view events and personalization

  useEffect(() => {
    if (!page) {
      return;
    }

    const mode = page.mode;
    if (!mode.isNormal) {
      console.debug('Browser Events SDK is not initialized in edit and preview modes');
      return;
    }

    const personalizeContextId =
      process.env.NEXT_PUBLIC_SITECORE_PERSONALIZE_CONTEXT_ID ||
      config.api.edge?.clientContextId;
    const personalizeSiteName =
      process.env.NEXT_PUBLIC_SITECORE_PERSONALIZE_SITE_NAME || page.siteName || config.defaultSite;
    const personalizeEdgeContextId = personalizeContextId || config.api.edge?.clientContextId;

    if (personalizeEdgeContextId) {
      CloudSDK({
        sitecoreEdgeUrl: config.api.edge.edgeUrl,
        sitecoreEdgeContextId: personalizeEdgeContextId,
        siteName: personalizeSiteName,
        enableBrowserCookie: true,
        // Replace with the top level cookie domain of the website that is being integrated e.g ".example.com" and not "www.example.com"
        cookieDomain: window.location.hostname.replace(/^www\./, ''),
      })
        .addEvents()
        .addPersonalize({
          enablePersonalizeCookie: true,
        })
        .initialize();

      const personalizeClientKey = process.env.NEXT_PUBLIC_SITECORE_PERSONALIZE_CLIENT_KEY;
      const edgeUrl = config.api.edge.edgeUrl;
      const edgeContextId = personalizeEdgeContextId;

      /**
       * Load the Personalize web SDK dynamically using the Edge CDN URL.
       * @returns {Promise<void>} A promise that resolves when the script is loaded.
       */
      const loadPersonalizeScript = async (): Promise<void> => {
        if (!edgeUrl || !edgeContextId || !personalizeClientKey) {
          console.error('Personalize settings missing from configuration');
          return;
        }

        const existingScript = document.querySelector(
          'script[data-sc-personalize="true"]'
        ) as HTMLScriptElement | null;
        if (existingScript) {
          return;
        }

        try {
          const cdnUrlResponse = await fetch(
            `${edgeUrl}/v1/personalize/cdn-url?sitecoreContextId=${edgeContextId}&client_key=${personalizeClientKey}`
          );
          if (!cdnUrlResponse.ok) {
            console.error('Failed to load Personalize CDN URL');
            return;
          }

          const cdnUrl = await cdnUrlResponse.text();
          if (!cdnUrl) {
            console.error('Personalize CDN URL is empty');
            return;
          }

          if (window.scCloudSDK?.personalize) {
            window.scCloudSDK.personalize.settings = {
              async: true,
              defer: true,
            };
          }

          const script = document.createElement('script');
          script.src = cdnUrl;
          script.async = true;
          script.defer = true;
          script.dataset.scPersonalize = 'true';
          document.head.appendChild(script);
        } catch (error) {
          console.error('Failed to initialize Personalize web SDK', error);
        }
      };

      void loadPersonalizeScript();

      /**
       * Load and initialize the Engage SDK to register a page view.
       * @returns {Promise<void>} A promise that resolves when the page view is sent.
       */
      const loadEngageSdk = async (): Promise<void> => {
        if (!personalizeClientKey || !personalizeSiteName) {
          console.error('Engage settings missing from configuration');
          return;
        }

        const engageSdk = (window as unknown as { Engage?: EngageSdk }).Engage;
        if (engageSdk) {
          return;
        }

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://d1mj578wat5n4o.cloudfront.net/sitecore-engage-v.1.3.0.min.js';
        document.head.appendChild(script);

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Engage SDK'));
        });

        const engageInstance = await (window as unknown as { Engage: EngageSdk }).Engage.init({
          clientKey: personalizeClientKey,
          targetURL: 'https://api-engage-us.sitecorecloud.io',
          pointOfSale: personalizeSiteName,
          cookieDomain: window.location.hostname.replace(/^www\./, ''),
          cookieExpiryDays: 365,
          webPersonalization: 'true',
        });

        await engageInstance.pageView({
          channel: 'WEB',
          language: 'EN',
          currency: 'USD',
          page: window.location.pathname + window.location.search,
        });
      };

      void loadEngageSdk();
    } else {
      console.error('Client Edge API settings missing from configuration');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.siteName]);

  return null;
};

export default Bootstrap;
