import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'viem/chains';
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';
import { useEffect } from 'react';

const projectId = '1dd9135e45cf4362afb13efa00ae3148';
const isMainnet = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const config = getDefaultConfig({
  appName: 'Crypto Puzzles App',
  projectId: projectId,
  chains: [base, baseSepolia],
  ssr: true,
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org')
  },
});

function MyApp({ Component, pageProps }) {
  // Mobile touch prevention only
  useEffect(() => {
    const preventZoom = (e) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    document.addEventListener('touchstart', preventZoom, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventZoom);
    };
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          initialChain={isMainnet ? base : baseSepolia}
          coolMode
          showRecentTransactions={true}
          appInfo={{
            appName: 'Puzzle NFT Generator',
          }}
          modalSize="compact"
          overlayBlur="small"
        >
          {/* Global styles for proper mobile behavior */}
          <style jsx global>{`
            * {
              box-sizing: border-box;
              -webkit-tap-highlight-color: transparent;
            }
            
            body {
              margin: 0;
              padding: 0;
              min-height: 100vh;
              width: 100%;
              position: relative;
            }
            
            /* Allow vertical scrolling */
            html {
              overflow-y: auto;
              scroll-behavior: smooth;
            }
          `}</style>
          
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;