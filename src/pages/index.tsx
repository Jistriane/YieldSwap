import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [swapData, setSwapData] = useState({
    from: '',
    amount: '',
    to: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);

  // Configuração dos idiomas disponíveis
  const languages = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === router.locale) || languages[0];

  // Efeito de partículas flutuantes
  useEffect(() => {
    const newParticles = Array.from({length: 20}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setParticles(newParticles);
  }, []);

  // Função para trocar idioma
  const handleLanguageChange = (languageCode: string) => {
    router.push(router.pathname, router.asPath, { locale: languageCode });
    setShowLanguageMenu(false);
  };

  // Função para gerar um endereço de carteira simulado
  const generateWalletAddress = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let address = 'G';
    for (let i = 0; i < 55; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  };

  // Função para formatar o endereço da carteira (mostra apenas início e fim)
  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleConnectWallet = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (!isConnected) {
        // Conectando - gera novo endereço
        const newAddress = generateWalletAddress();
        setWalletAddress(newAddress);
        setIsConnected(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
      } else {
        // Desconectando
        setWalletAddress('');
        setIsConnected(false);
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleSwapClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      const message = isConnected 
        ? `🚀 YieldSwap funcionando perfeitamente!\n\n✨ Interface moderna ativada\n🎯 Sistema responsivo\n💎 UX otimizada\n🔗 Carteira: ${formatWalletAddress(walletAddress)}\n🌐 Idioma: ${currentLanguage.name}`
        : `🚀 YieldSwap funcionando perfeitamente!\n\n✨ Interface moderna ativada\n🎯 Sistema responsivo\n💎 UX otimizada\n⚠️ Conecte sua carteira primeiro\n🌐 Idioma: ${currentLanguage.name}`;
      alert(message);
      setIsLoading(false);
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setSwapData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <style jsx global>{`
        body {
          display: block !important;
          visibility: visible !important;
          overflow-x: hidden;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slide-down {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
          opacity: 0.7;
        }
        
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .gradient-border {
          position: relative;
          background: linear-gradient(145deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          border: 1px solid transparent;
        }
        
        .gradient-border::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(145deg, #3b82f6, #8b5cf6);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
        }
        
        .language-dropdown {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
      
      <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Partículas de fundo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle, index) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${index * 0.3}s`,
                animationDuration: `${6 + (index % 3)}s`
              }}
            />
          ))}
        </div>

        {/* Gradiente de fundo animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse-slow" />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header moderno */}
          <header className="flex justify-between items-center mb-12 animate-slide-up">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform">
                YieldSwap
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Seletor de idioma funcional */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="glassmorphism rounded-xl px-4 py-2 cursor-pointer hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
                >
                  <span className="text-lg">{currentLanguage.flag}</span>
                  <span className="font-medium">{currentLanguage.name}</span>
                  <span className={`text-sm transition-transform duration-200 ${showLanguageMenu ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {/* Dropdown de idiomas */}
                {showLanguageMenu && (
                  <div className="absolute top-full right-0 mt-2 glassmorphism rounded-xl overflow-hidden shadow-xl language-dropdown z-50">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`w-full px-4 py-3 text-left hover:bg-white/20 transition-colors flex items-center space-x-3 ${
                          language.code === router.locale ? 'bg-blue-500/20' : ''
                        }`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span className="font-medium whitespace-nowrap">{language.name}</span>
                        {language.code === router.locale && (
                          <span className="text-green-400 text-sm">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleConnectWallet}
                disabled={isLoading}
                className={`relative font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isConnected 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/25' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25'
                } ${isLoading ? 'animate-pulse cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('wallet.connecting') || 'Conectando...'}</span>
                  </div>
                ) : isConnected ? (
                  <div className="flex items-center space-x-2">
                    <span>✅</span>
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{t('wallet.connected') || 'Conectado'}</span>
                      <span className="text-xs font-mono opacity-80">
                        {formatWalletAddress(walletAddress)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>🔗</span>
                    <span>{t('wallet.connect') || 'Conectar Carteira'}</span>
                  </div>
                )}
              </button>
            </div>
          </header>

          {/* Overlay para fechar dropdown */}
          {showLanguageMenu && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowLanguageMenu(false)}
            />
          )}

          {/* Notificação de sucesso moderna */}
          {showSuccess && (
            <div className="max-w-lg mx-auto mb-8 animate-slide-up">
              <div className="glassmorphism rounded-2xl p-4 border border-green-400/30 bg-gradient-to-r from-green-400/10 to-emerald-400/10">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-green-300 font-semibold">{t('wallet.connected') || 'Carteira conectada!'}</p>
                    <p className="text-green-200/80 text-sm">
                      {t('wallet.address') || 'Endereço'}: <span className="font-mono">{formatWalletAddress(walletAddress)}</span>
                    </p>
                    <p className="text-green-200/60 text-xs mt-1">{t('wallet.ready') || 'Pronto para fazer swaps'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Card principal moderno */}
          <div className="max-w-lg mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="glassmorphism rounded-3xl p-8 shadow-2xl shadow-purple-500/10 gradient-border">
              {/* Header do card */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {t('swap.title') || 'Swap & Earn'}
                </h2>
                <p className="text-gray-300/80">{t('swap.subtitle') || 'Troque tokens e ganhe rendimento'}</p>
                {isConnected && (
                  <div className="mt-3 glassmorphism rounded-lg p-2">
                    <p className="text-xs text-gray-400">{t('wallet.connected') || 'Carteira conectada'}:</p>
                    <p className="font-mono text-sm text-green-400">{formatWalletAddress(walletAddress)}</p>
                  </div>
                )}
              </div>

              {/* Status indicators */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glassmorphism rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">🚀</div>
                  <div className="text-green-400 font-semibold text-sm">API Online</div>
                </div>
                <div className="glassmorphism rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{isConnected ? '🔗' : '⚡'}</div>
                  <div className={`font-semibold text-sm ${isConnected ? 'text-green-400' : 'text-blue-400'}`}>
                    {isConnected ? (t('wallet.connected') || 'Carteira OK') : 'Sistema Ativo'}
                  </div>
                </div>
              </div>

              {/* Formulário de swap moderno */}
              <div className="space-y-6">
                <div className="space-y-4">
                  {/* Campo De */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <span className="flex items-center space-x-2">
                        <span>📤</span>
                        <span>{t('swap.from') || 'De'}</span>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="USDC"
                        value={swapData.from}
                        onChange={(e) => handleInputChange('from', e.target.value)}
                        className="w-full glassmorphism rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 placeholder-gray-400"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                          $
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campo Quantidade */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <span className="flex items-center space-x-2">
                        <span>💰</span>
                        <span>{t('swap.amount') || 'Quantidade'}</span>
                      </span>
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={swapData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      className="w-full glassmorphism rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 placeholder-gray-400"
                    />
                  </div>

                  {/* Ícone de troca */}
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer hover:rotate-180 transition-transform duration-500">
                      <span className="text-xl">🔄</span>
                    </div>
                  </div>

                  {/* Campo Para */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <span className="flex items-center space-x-2">
                        <span>📥</span>
                        <span>{t('swap.to') || 'Para'}</span>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="XLM"
                        value={swapData.to}
                        onChange={(e) => handleInputChange('to', e.target.value)}
                        className="w-full glassmorphism rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-300 placeholder-gray-400"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-xs font-bold">
                          ⭐
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações de swap */}
                {(swapData.from || swapData.amount || swapData.to) && (
                  <div className="glassmorphism rounded-xl p-4 space-y-2 animate-slide-up">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{t('swap.rate') || 'Taxa de câmbio'}</span>
                      <span className="text-blue-400 font-medium">1 USDC = 0.25 XLM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{t('swap.apy') || 'APY estimado'}</span>
                      <span className="text-green-400 font-medium">12.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{t('swap.networkFee') || 'Taxa de rede'}</span>
                      <span className="text-purple-400 font-medium">0.001 XLM</span>
                    </div>
                  </div>
                )}

                {/* Botão de swap moderno */}
                <button
                  onClick={handleSwapClick}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                    isLoading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : isConnected
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:scale-105 hover:shadow-xl shadow-lg shadow-purple-500/25 cursor-pointer'
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('swap.button.loading') || 'Processando...'}</span>
                    </div>
                  ) : !isConnected ? (
                    <div className="flex items-center justify-center space-x-2">
                      <span>🔒</span>
                      <span>{t('wallet.connect') || 'Conecte sua Carteira'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>🚀</span>
                      <span>{t('swap.button.execute') || 'Executar Swap'}</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer moderno */}
          <div className="text-center mt-12 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <p className="text-gray-400/60 text-sm">
              Powered by <span className="text-purple-400 font-semibold">YieldSwap Protocol</span>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
} 