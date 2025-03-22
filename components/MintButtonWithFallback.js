import React, { useState, useEffect } from 'react';

const MintButtonWithFallback = ({ handleMint, image, loading, isDarkMode, mintStatus }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  // Helper function to detect available wallet providers
  const detectWalletProvider = () => {
    // Check for window.ethereum (MetaMask, etc.)
    if (window.ethereum) return window.ethereum;
    
    // Check for other wallet providers commonly available on mobile
    if (window.coinbaseWallet) return window.coinbaseWallet;
    if (window.walletConnect) return window.walletConnect;
    if (window.trustWallet) return window.trustWallet;
    
    // Check for generic web3 provider
    if (window.web3 && window.web3.currentProvider) return window.web3.currentProvider;
    
    return null;
  };

  const handleMintClick = async () => {
    try {
      setError(null);
      
      // Detect available wallet provider
      const provider = detectWalletProvider();
      
      if (!provider) {
        if (isMobile) {
          // Mobile-specific deep linking to wallets
          setShowHelp(true);
          
          // Detect if we're in a mobile browser vs in-app browser
          const isStandaloneBrowser = !window.navigator.userAgent.includes('MetaMask') && 
                                      !window.navigator.userAgent.includes('Trust') &&
                                      !window.navigator.userAgent.includes('Coinbase');
          
          if (isStandaloneBrowser) {
            setError("No wallet detected. Please open this page in your wallet browser or use the links below.");
            
            // Attempt to deep link to a wallet
            const dappUrl = encodeURIComponent(window.location.href);
            
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
              // iOS deep links
              window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
            } else {
              // Android deep links
              window.location.href = `intent://metamask.app/connect#Intent;scheme=metamask;package=io.metamask;end;`;
            }
            return;
          } else {
            setError("Wallet detection issue. Please see mobile wallet tips below.");
            return;
          }
        } else {
          setError("Please install MetaMask or another Ethereum wallet to mint.");
          return;
        }
      }
      
      // Check if wallet is connected
      let isConnected = false;
      
      try {
        // Different providers have different ways to check connection
        if (provider.selectedAddress) {
          isConnected = true;
        } else if (provider.request) {
          const accounts = await provider.request({ method: 'eth_accounts' });
          isConnected = accounts && accounts.length > 0;
        } else if (provider.enable) {
          // Legacy method
          const accounts = await provider.enable();
          isConnected = accounts && accounts.length > 0;
        }
      } catch (e) {
        console.error("Error checking connection:", e);
        isConnected = false;
      }
      
      if (!isConnected) {
        try {
          // Try to connect using the appropriate method
          if (provider.request) {
            await provider.request({ method: 'eth_requestAccounts' });
          } else if (provider.enable) {
            await provider.enable();
          }
        } catch (connectError) {
          console.error("Connection error:", connectError);
          
          if (isMobile) {
            setError("Wallet connection failed. Please try connecting manually in your wallet app.");
            setShowHelp(true);
            return;
          } else {
            setError("Please connect your wallet first");
            return;
          }
        }
      }
      
      // Check if we're on the correct network
      try {
        const chainId = await provider.request({ method: 'eth_chainId' });
        const requiredChainId = '0x2105'; // Base mainnet
        
        if (chainId !== requiredChainId) {
          if (isMobile) {
            setError("Please switch to Base network in your wallet settings.");
            setShowHelp(true);
            // We don't return here to allow the user to proceed anyway
          }
        }
      } catch (networkError) {
        console.warn("Network check error:", networkError);
        // Non-blocking error, continue with minting
      }
      
      // Mobile-specific guidance without confirmation dialog
      if (isMobile) {
        // Display important message but don't block with confirm dialog
        setShowHelp(true);
      }
      
      // Proceed with minting for both mobile and desktop
      await handleMint();
      
    } catch (error) {
      console.error("Mint button error:", error);
      setError(error.message || "Failed to mint. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Status messages */}
      {mintStatus && mintStatus.status === "pending" && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <p>{mintStatus.message}</p>
          {isMobile && (
            <p className="text-sm mt-2 font-bold">
              Important: Keep your wallet app open during this entire process!
            </p>
          )}
        </div>
      )}
      
      {mintStatus && mintStatus.status === "warning" && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>{mintStatus.message}</p>
        </div>
      )}
      
      {mintStatus && mintStatus.status === "success" && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{mintStatus.message}</p>
          {mintStatus.hash && (
            <a 
              href={`https://basescan.org/tx/${mintStatus.hash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline"
            >
              View transaction on BaseScan
            </a>
          )}
        </div>
      )}
      
      {mintStatus && mintStatus.status === "error" && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{mintStatus.message}</p>
        </div>
      )}
      
      <button 
        onClick={handleMintClick} 
        disabled={!image || loading}
        className={`w-full py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold ${
          (!image || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:translate-y-[-2px]'
        } ${
          isDarkMode ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
        }`}
      >
        {loading ? (
          <>
            <div className="animate-spin h-5 w-5 rounded-full border-2 border-white border-t-transparent"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span className="text-lg">Mint as NFT</span>
          </>
        )}
      </button>

      {/* Mobile guidance */}
      {isMobile && (
        <div className="mt-2">
          <button 
            onClick={() => setShowHelp(!showHelp)} 
            className="text-sm text-gray-500 underline flex items-center justify-center mt-1"
          >
            {showHelp ? "Hide mobile wallet tips" : "Having issues on mobile? Click here"}
          </button>

          {showHelp && (
            <div className="mt-2 p-4 bg-gray-100 rounded-lg text-sm">
              <h4 className="font-bold">Mobile Wallet Tips:</h4>
              <ul className="list-disc pl-5 mt-1">
                <li>Make sure your wallet app (MetaMask, etc.) is installed</li>
                <li className="font-bold">IMPORTANT: Keep your wallet app open during the entire minting process</li>
                <li>Ensure you have sufficient funds for the NFT and gas fees</li>
                <li>Connect your wallet before minting</li>
                <li>Switch to the Base network in your wallet settings</li>
                <li>If transaction doesn't appear in your wallet, restart the app</li>
                <li>For best results, try minting on desktop</li>
              </ul>
              
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => {
                    // Open MetaMask app directly
                    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                      window.location.href = 'https://metamask.app.link/';
                    } else {
                      window.location.href = 'intent://metamask.app/#Intent;scheme=metamask;package=io.metamask;end;';
                    }
                  }} 
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Open Wallet App
                </button>
                
                <button
                  onClick={() => {
                    // Attempt to switch to Base network
                    const provider = detectWalletProvider();
                    if (provider) {
                      provider.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x2105' }], // Base mainnet chainId
                      }).catch(console.error);
                    } else {
                      alert("Wallet not detected. Please install MetaMask first.");
                    }
                  }}
                  className="flex-1 py-2 bg-purple-500 text-white rounded-lg"
                >
                  Switch to Base
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MintButtonWithFallback;