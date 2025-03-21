import React, { useState, useEffect } from 'react';

const MintButtonWithFallback = ({ handleMint, image, loading, isDarkMode }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  const handleMintClick = async () => {
    try {
      setError(null);
      
      // Check if wallet is connected first
      if (!window.ethereum || !window.ethereum.selectedAddress) {
        if (isMobile) {
          // Handle mobile wallet connection
          const dappUrl = encodeURIComponent(window.location.href);
          
          if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
          } else {
            window.location.href = `intent://metamask.app/connect#Intent;scheme=metamask;package=io.metamask;end;`;
          }
          
          setError("Please connect your wallet first");
          return;
        } else {
          setError("Please connect your wallet first");
          return;
        }
      }
      
      // Check if on correct network (Base or Base Sepolia)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const baseChainId = '0x14a33'; // Chain ID for Base (84531 in hex)
      const baseSepoliaChainId = '0x14a34'; // Chain ID for Base Sepolia (84532 in hex)
      
      if (chainId !== baseChainId && chainId !== baseSepoliaChainId) {
        setError("Please switch to Base or Base Sepolia network in your wallet");
        return;
      }
      
      // Proceed with minting
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

      {/* Help button for mobile users */}
      {isMobile && (
        <div className="mt-2">
          <button 
            onClick={() => setShowHelp(!showHelp)} 
            className="text-sm text-gray-500 underline flex items-center justify-center mt-1"
          >
            Having issues on mobile? Click here
          </button>

          {showHelp && (
            <div className="mt-2 p-4 bg-gray-100 rounded-lg text-sm">
              <h4 className="font-bold">Mobile Wallet Tips:</h4>
              <ul className="list-disc pl-5 mt-1">
                <li>Make sure your wallet app (MetaMask, etc.) is installed</li>
                <li>If the app doesn't open automatically, try manually opening it first</li>
                <li>Connect your wallet before minting</li>
                <li>Switch to the Base network in your wallet settings</li>
                <li>If all else fails, try minting on desktop</li>
              </ul>
              <button 
                onClick={() => {
                  // Alternative direct MetaMask app open for mobile
                  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    window.location.href = 'https://metamask.app.link/';
                  } else {
                    window.location.href = 'intent://metamask.app/#Intent;scheme=metamask;package=io.metamask;end;';
                  }
                }} 
                className="mt-3 w-full py-2 bg-blue-500 text-white rounded-lg"
              >
                Open Wallet App Directly
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MintButtonWithFallback;