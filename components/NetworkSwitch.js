// components/NetworkSwitch.js
import { useSwitchNetwork } from 'wagmi';

const NetworkSwitch = () => {
  const { switchNetwork } = useSwitchNetwork();
  
  return (
    <div className="network-switch-buttons">
      <button 
        onClick={() => switchNetwork?.(base.id)}
        className="network-button base-mainnet"
      >
        🚀 Switch to Base Mainnet
      </button>
      <button 
        onClick={() => switchNetwork?.(baseSepolia.id)}
        className="network-button base-testnet"
      >
        🔨 Switch to Base Sepolia
      </button>
    </div>
  );
};

export default NetworkSwitch;