/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import React from 'react';
import { Story, Meta } from '@storybook/react';
import { YieldSwap } from './YieldSwap';

export default {
  title: 'SDK/YieldSwap',
  component: YieldSwap,
} as Meta;

const Template: Story = () => {
  const sdk = new YieldSwap({
    api: {
      baseURL: 'http://localhost:3001',
    },
    websocket: {
      url: 'ws://localhost:3001',
    },
  });

  React.useEffect(() => {
    sdk.connect();
    return () => sdk.disconnect();
  }, []);

  return (
    <div>
      <h1>YieldSwap SDK</h1>
      <p>Open the console to see the SDK in action.</p>
      <pre>
        {`
const sdk = new YieldSwap({
  api: {
    baseURL: 'http://localhost:3001',
  },
  websocket: {
    url: 'ws://localhost:3001',
  },
});

sdk.connect();
        `}
      </pre>
    </div>
  );
};

export const Default = Template.bind({}); 