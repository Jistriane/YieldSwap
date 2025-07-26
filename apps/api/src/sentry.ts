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
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { ConfigService } from '@nestjs/config';

export function setupSentry(configService: ConfigService) {
  const dsn = configService.get<string>('SENTRY_DSN');
  const environment = configService.get<string>('NODE_ENV') || 'development';

  if (!dsn || dsn === 'YOUR_SENTRY_DSN') {
    console.warn('Sentry DSN não configurado. Monitoramento desabilitado.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Configurações adicionais
    maxBreadcrumbs: 50,
    attachStacktrace: true,
    debug: environment !== 'production',
    
    // Ignorar erros específicos
    ignoreErrors: [
      'Non-Error exception captured',
      'Non-Error promise rejection captured',
    ],
    
    // Sanitizar dados sensíveis
    beforeSend(event) {
      // Remover dados sensíveis
      if (event.request?.data && typeof event.request.data === 'object') {
        const data = event.request.data as any;
        delete data.password;
        delete data.privateKey;
      }
      return event;
    },
  });

  // Capturar exceções não tratadas
  process.on('unhandledRejection', (error: Error) => {
    Sentry.captureException(error);
  });

  process.on('uncaughtException', (error: Error) => {
    Sentry.captureException(error);
  });
}

// Função helper para criar span manual
export function createSpan(name: string, operation: string) {
  return Sentry.startSpan({
    name,
    op: operation,
  }, () => {
    // Span será automaticamente finalizado
  });
} 