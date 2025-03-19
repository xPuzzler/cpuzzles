import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'viem/chains';
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';

// WalletConnect Cloud Project ID
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
  chains: [base, baseSepolia], // Both chains
  ssr: true,
  transports: {
    [base.id]: http('https://mainnet.base.org'), // Mainnet RPC
    [baseSepolia.id]: http('https://sepolia.base.org') // Testnet RPC
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
      <RainbowKitProvider 
          initialChain={isMainnet ? base : baseSepolia} // Default to testnet
          coolMode
          showRecentTransactions={true}
          appInfo={{
            appName: 'Puzzle NFT Generator',
          }}
        >
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;