import * as Sentry from "@sentry/react";

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (dsn) {
    Sentry.init({
      dsn: dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE,
      beforeSend(event) {
        return event;
      },
    });
    
    console.log("[Sentry] Initialized with DSN");
  } else if (import.meta.env.DEV) {
    // 仅在开发环境下打印更简洁的提示，避免干扰
    console.log("[Sentry] Info: Monitoring is disabled (No DSN)");
  }
};

export default Sentry;
