import React, { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'viem/chains';
import NetworkSwitch from './NetworkSwitch'; // Make sure to create this component

const WalletConnect = () => {
  // Add detection for mobile devices
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Detect if the user is on a mobile device
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
                    onClick={isMobile ? handleMobileConnect : openConnectModal} 
                    className="btn-primary"
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
                    className="btn-primary"
                    title="Switch Network"
                  >
                    {chain.name === 'Base' ? '🚀 Base' : '🔨 Base Sepolia'}
                  </button>
                  <button 
                    onClick={openAccountModal} 
                    className="btn-primary"
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
  
  // Helper function for mobile wallet connection
  function handleMobileConnect() {
    try {
      // Get the current URL for deep linking back to the dApp
      const dappUrl = encodeURIComponent(window.location.href);
      
      // Use universal links for iOS and deep links for Android
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // Use universal links for iOS
        window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
      } else {
        // Use intent URL for Android (more reliable than metamask://)
        window.location.href = `intent://metamask.app/connect#Intent;scheme=metamask;package=io.metamask;end;`;
      }
    } catch (error) {
      console.error("Error connecting mobile wallet:", error);
    }
  }
};

export default WalletConnect;