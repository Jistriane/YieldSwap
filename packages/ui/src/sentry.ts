import * as Sentry from '@sentry/react';

export function initSentry(dsn: string) {
  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export function withSentry<P extends object>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  return Sentry.withProfiler(Component);
}

export function useSentryProfiler(id: string) {
  return Sentry.useProfiler(id);
}

export function captureException(error: Error) {
  Sentry.captureException(error);
}

export function captureMessage(message: string) {
  Sentry.captureMessage(message);
}

export function setUser(id: string) {
  Sentry.setUser({ id });
}

export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

export function setExtra(key: string, value: unknown) {
  Sentry.setExtra(key, value);
} 