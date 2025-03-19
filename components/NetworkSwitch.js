// components/NetworkSwitch.js
import { useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'viem/chains';

const NetworkSwitch = () => {
  const { switchChain } = useSwitchChain();
  
  return (
    <div className="network-switch-buttons">
      <button 
        onClick={() => switchChain?.({ chainId: base.id })}
        className="network-button base-mainnet"
      >
        🚀 Switch to Base Mainnet
      </button>
      <button 
        onClick={() => switchChain?.({ chainId: baseSepolia.id })}
        className="network-button base-testnet"
      >
        🔨 Switch to Base Sepolia
      </button>
    </div>
  );
};

export default NetworkSwitch;