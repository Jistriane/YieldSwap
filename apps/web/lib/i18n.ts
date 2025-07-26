/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

export const languages = ['pt', 'en', 'es'] as const;
export type Language = (typeof languages)[number];

export const defaultNS = 'common';

export function getOptions(lng = 'pt', ns = defaultNS) {
  return {
    supportedLngs: languages,
    fallbackLng: 'en',
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}

export async function initI18next(lng: string, ns?: string) {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`../public/locales/${language}/${namespace}.json`),
      ),
    )
    .init(getOptions(lng, ns));

  return i18nInstance;
}

export async function useTranslation(lng: string, ns?: string, options: { keyPrefix?: string } = {}) {
  const i18nextInstance = await initI18next(lng, ns);
  return {
    t: i18nextInstance.getFixedT(lng, ns, options.keyPrefix),
    i18n: i18nextInstance,
  };
} 