import React, { useState, useEffect } from 'react';

const MintButtonWithFallback = ({ handleMint, image, loading, isDarkMode, mintStatus }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMetaMaskBrowser, setIsMetaMaskBrowser] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState(null);
  const [pendingTransaction, setPendingTransaction] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const mobileDetected = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobileDetected);
    
    // Specifically detect if we're in MetaMask browser
    const isMMBrowser = window.navigator.userAgent.includes('MetaMask');
    setIsMetaMaskBrowser(isMMBrowser);
    
    // Check for pending transactions on load
    const checkPendingTransactions = async () => {
      try {
        if (window.ethereum) {
          const provider = window.ethereum;
          const accounts = await provider.request({ method: 'eth_accounts' });
          
          if (accounts && accounts.length > 0) {
            const address = accounts[0];
            
            // Get pending transactions count
            const pendingCount = await provider.request({
              method: 'eth_getTransactionCount',
              params: [address, 'pending']
            });
            
            const latestCount = await provider.request({
              method: 'eth_getTransactionCount',
              params: [address, 'latest']
            });
            
            if (parseInt(pendingCount, 16) > parseInt(latestCount, 16)) {
              setPendingTransaction(true);
            }
          }
        }
      } catch (err) {
        console.warn("Could not check pending transactions:", err);
      }
    };
    
    checkPendingTransactions();
  }, []);

  const handleMintClick = async () => {
    try {
      setError(null);
      
      // Clear any previous errors
      if (pendingTransaction) {
        if (!window.confirm("You have pending transactions. Continuing may cause issues. Do you want to proceed anyway?")) {
          return;
        }
        setPendingTransaction(false);
      }
      
      // Special case for MetaMask browser on mobile
      if (isMobile && isMetaMaskBrowser) {
        // Show mobile-specific guidance
        setShowHelp(true);
        
        try {
          // Start minting process
          await handleMint();
        } catch (err) {
          setError(`Minting failed: ${err.message || "Unknown error"}`);
        }
        return;
      }

      // Standard browser flow
      if (!window.ethereum && !window.web3?.currentProvider) {
        if (isMobile) {
          setError("No wallet detected. Please open in your wallet's browser or install MetaMask.");
          setShowHelp(true);
          
          // Deep linking to MetaMask
          if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
          } else {
            window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
          }
          return;
        } else {
          setError("Please install MetaMask or another Ethereum wallet to mint.");
          return;
        }
      }
      
      // Get the provider
      const provider = window.ethereum || window.web3.currentProvider;
      
      // Ensure connection
      try {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (!accounts || accounts.length === 0) {
          const requestedAccounts = await provider.request({ method: 'eth_requestAccounts' });
          if (!requestedAccounts || requestedAccounts.length === 0) {
            throw new Error("Failed to connect to wallet");
          }
        }
      } catch (connectError) {
        console.error("Connection error:", connectError);
        
        if (connectError.code === 4001) { // User rejected request
          setError("You must connect your wallet to mint. Please try again.");
        } else {
          setError("Wallet connection failed. Please restart your wallet app and try again.");
        }
        return;
      }
      
      // Check network and attempt to switch if needed
      try {
        const chainId = await provider.request({ method: 'eth_chainId' });
        // Use Base network chainId
        const requiredChainId = '0x2105'; // Base Mainnet
        
        if (chainId !== requiredChainId) {
          try {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: requiredChainId }],
            });
          } catch (switchError) {
            // This error code indicates the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              setError("Please add the Base network to your wallet first.");
              return;
            } else {
              setError("Please switch to the Base network in your wallet settings.");
              if (isMobile) setShowHelp(true);
              return;
            }
          }
        }
      } catch (networkError) {
        console.warn("Network check error:", networkError);
        // Continue with minting
      }
      
      // Mobile-specific guidance
      if (isMobile) {
        setShowHelp(true);
      }
      
      // Proceed with minting
      try {
        await handleMint();
      } catch (mintError) {
        console.error("Mint error:", mintError);
        setError(mintError.message || "Minting failed. Please try again.");
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
      
      {pendingTransaction && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>You have pending transactions in your wallet. This may interfere with new minting attempts.</p>
          <button 
            className="underline mt-1 text-sm" 
            onClick={() => setPendingTransaction(false)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Status messages */}
      {mintStatus && mintStatus.status === "pending" && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <p>{mintStatus.message}</p>
          {isMobile && (
            <div className="mt-2 font-bold">
              <p className="text-sm">IMPORTANT: Keep your wallet app open during this entire process!</p>
              {isMetaMaskBrowser && (
                <p className="text-sm mt-1">If the transaction doesn't appear, check your MetaMask activity tab.</p>
              )}
            </div>
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
          {isMobile && isMetaMaskBrowser && (
            <p className="text-sm mt-2">
              Check your MetaMask activity tab to see if the transaction is still processing.
            </p>
          )}
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

      {/* Mobile guidance - enhanced for MetaMask browser */}
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
                {isMetaMaskBrowser ? (
                  // MetaMask browser specific tips
                  <>
                    <li className="font-bold">If the transaction is taking too long, check your Activity tab in MetaMask</li>
                    <li>Try setting your gas to "Fast" or "Aggressive" in MetaMask settings</li>
                    <li>Make sure your MetaMask app is updated to the latest version</li>
                    <li>Ensure you don't have pending transactions that might be causing conflicts</li>
                    <li>If the transaction fails, try restarting the MetaMask app completely</li>
                  </>
                ) : (
                  // Standard mobile tips
                  <>
                    <li>Make sure your wallet app (MetaMask, etc.) is installed</li>
                    <li className="font-bold">IMPORTANT: Keep your wallet app open during the entire minting process</li>
                    <li>Ensure you have sufficient funds for the NFT and gas fees</li>
                    <li>Switch to the Base network in your wallet settings</li>
                    <li>For best results, try opening this page in your wallet's browser app</li>
                  </>
                )}
              </ul>
              
              <div className="mt-3 flex gap-2">
                {!isMetaMaskBrowser && (
                  <button 
                    onClick={() => {
                      // Open MetaMask app directly with deep linking
                      window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
                    }} 
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Open in MetaMask
                  </button>
                )}
                
                {isMetaMaskBrowser && (
                  <button
                    onClick={() => {
                      // Open the activity tab in MetaMask
                      window.location.href = "https://metamask.app/activity";
                    }}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Check Transactions
                  </button>
                )}
                
                <button
                  onClick={() => {
                    // Switch to Base network or refresh wallet connection
                    const provider = window.ethereum || window.web3?.currentProvider;
                    if (provider) {
                      provider.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x2105' }], // Base mainnet chainId
                      }).catch(() => {
                        alert("Please switch to Base network manually in your wallet settings.");
                      });
                    } else {
                      alert("Wallet not detected. Please open in your wallet's browser.");
                    }
                  }}
                  className="flex-1 py-2 bg-purple-500 text-white rounded-lg"
                >
                  Switch to Base
                </button>
              </div>
              
              {isMetaMaskBrowser && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-300 rounded">
                  <p className="font-bold">MetaMask Browser Troubleshooting:</p>
                  <ol className="list-decimal pl-5 mt-1">
                    <li>Go to MetaMask Settings → Advanced</li>
                    <li>Reset Account (this clears transaction history but keeps your funds)</li>
                    <li>Return here and try minting again</li>
                    <li>Still not working? Try a desktop browser for most reliable experience</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MintButtonWithFallback;