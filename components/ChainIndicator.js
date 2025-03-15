// components/ChainIndicator.js
import { useChainId } from 'wagmi';

export default function ChainIndicator() {
  const chainId = useChainId();
  
  return (
    <div className={`chain-indicator ${
      chainId === base.id ? 'mainnet' : 'testnet'
    }`}>
      {chainId === base.id ? 'Mainnet' : 'Testnet'}
    </div>
  );
}