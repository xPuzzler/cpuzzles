import React, { useState, useEffect } from 'react';

const MintButtonWithFallback = ({ handleMint, image, loading, isDarkMode, mintStatus }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleMintClick = async () => {
    try {
      setError(null);
      
      // Enhanced pre-mint checks
      if (!window.ethereum) {
        if (isMobile) {
          setShowHelp(true);
          setError("No wallet detected. Please see mobile wallet tips below.");
          return;
        } else {
          setError("Please install MetaMask or another Ethereum wallet to mint.");
          return;
        }
      }
      
      // Check if wallet is connected
      const isConnected = window.ethereum.selectedAddress || (await window.ethereum.request({ method: 'eth_accounts' })).length > 0;
      
      if (!isConnected) {
        try {
          // Try to connect
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (connectError) {
          if (isMobile) {
            // Handle mobile connection
            const dappUrl = encodeURIComponent(window.location.href);
            
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
              window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
            } else {
              window.location.href = `intent://metamask.app/connect#Intent;scheme=metamask;package=io.metamask;end;`;
            }
            
            setError("Please connect your wallet first");
            setShowHelp(true);
            return;
          } else {
            setError("Please connect your wallet first");
            return;
          }
        }
      }
      
      // Mobile-specific pre-mint guidance
      if (isMobile) {
        // Create a warning dialog
        if (confirm("For successful minting on mobile:\n\n1. Keep your wallet app open during the entire process\n2. Don't switch between apps\n3. Make sure you have enough funds for gas\n\nReady to continue?")) {
          // Proceed with minting
          await handleMint();
        } else {
          // User canceled
          return;
        }
      } else {
        // Desktop - just proceed
        await handleMint();
      }
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
              Important: Keep your wallet app open during this process!
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
            <span className="text-lg">{isMobile ? "Mint as NFT (Mobile)" : "Mint as NFT"}</span>
          </>
        )}
      </button>

      {/* Enhanced mobile guidance */}
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
                    if (window.ethereum) {
                      window.ethereum.request({
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