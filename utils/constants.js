export const CONTRACT_ADDRESSES = {
  8453: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET || '', // Base Mainnet
  84532: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TESTNET || '0x4725F266C295E729F29a295b8F0e560EDD9a28b2' // Base Sepolia - hardcoded fallback
};

export const SUPPORTED_CHAINS = {
  MAINNET: 8453,    // Base
  TESTNET: 84532    // Base Sepolia
};

export const isChainSupported = (chainId) => {
  return Object.keys(CONTRACT_ADDRESSES).includes(chainId.toString()) && 
         CONTRACT_ADDRESSES[chainId] !== '' && 
         CONTRACT_ADDRESSES[chainId] !== null;
};

export const MINT_PRICE = 0.001; // in ETH
export const MAX_PER_WALLET = 25;

// Add network configuration
export const NETWORK_CONFIG = {
  84532: {
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org'
  },
  8453: {
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org'
  }
};