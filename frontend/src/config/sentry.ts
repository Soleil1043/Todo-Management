import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // 只有在生产环境下才初始化 Sentry，或者如果提供了 DSN
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (dsn) {
    Sentry.init({
      dsn: dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      // 性能监控采样率
      tracesSampleRate: 1.0,
      // 设置 tracePropagationTargets 以确定哪些请求应该包含 trace 信息
      tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
      // Session Replay 采样率
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      environment: import.meta.env.MODE,
      
      // 可以在这里添加自定义配置
      beforeSend(event) {
        // 在发送之前过滤掉敏感信息或特定错误
        return event;
      },
    });
    
    console.log("[Sentry] Initialized with DSN");
  } else {
    console.log("[Sentry] Skip initialization: No DSN provided in VITE_SENTRY_DSN");
  }
};

export default Sentry;
