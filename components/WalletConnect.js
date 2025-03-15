import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'viem/chains';
import NetworkSwitch from './NetworkSwitch'; // Make sure to create this component

const WalletConnect = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        // Check if connected to supported networks
        const isSupportedNetwork = chain?.id === base.id || chain?.id === baseSepolia.id;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button 
                    onClick={openConnectModal} 
                    className="connect-button"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (!isSupportedNetwork) {
                return (
                  <div className="network-alert">
                    <p>Please switch to Base or Base Sepolia</p>
                    <NetworkSwitch />
                  </div>
                );
              }

              return (
                <div className="wallet-info">
                  <button 
                    onClick={openChainModal} 
                    className="chain-button"
                    title="Switch Network"
                  >
                    {chain.name === 'Base' ? '🚀 Base' : '🔨 Base Sepolia'}
                  </button>
                  <button 
                    onClick={openAccountModal} 
                    className="address-button"
                    title="Account Details"
                  >
                    {account.displayName}
                    {account.displayBalance && ` (${account.displayBalance})`}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnect;