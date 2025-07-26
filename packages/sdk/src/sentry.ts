/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import * as Sentry from '@sentry/node';

export function initSentry(dsn: string) {
  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
  });
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