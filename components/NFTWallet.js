import React, { useState, useEffect } from 'react';
import NFTMirror from './NFTMirror';
import NFTGrid from './NFTGrid';

const NFTWallet = ({ walletAddress }) => {
  const [nfts, setNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Handle NFT selection
  const handleSelectNFT = (nft) => {
    setSelectedNFT(nft);
  };

  // Force refresh function
  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    setLastUpdateTime(new Date().toLocaleTimeString());
    // NFTMirror will handle the refresh since it watches for changes to isLoading
  };

  // Track when data was last updated
  useEffect(() => {
    if (!isLoading && nfts.length > 0) {
      setLastUpdateTime(new Date().toLocaleTimeString());
    }
  }, [isLoading, nfts]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your NFT Collection</h1>
        
        <div className="flex items-center gap-3">
          {lastUpdateTime && (
            <span className="text-xs text-gray-400">
              Last updated: {lastUpdateTime}
            </span>
          )}
          
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className={`px-3 py-1 rounded-lg text-sm ${
              isLoading 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? 'Refreshing...' : 'Refresh NFTs'}
          </button>
        </div>
      </div>
      
      {/* This component fetches the NFTs */}
      <NFTMirror 
        walletAddress={walletAddress} 
        setNFTs={setNFTs} 
        setIsLoading={setIsLoading} 
        setError={setError}
      />
      
      {/* Error message */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg mb-4">
          <p className="text-red-300">{error}</p>
          <button 
            onClick={handleRefresh}
            className="text-white bg-red-700 hover:bg-red-800 px-3 py-1 rounded mt-2 text-sm"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && nfts.length === 0 ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your NFTs...</p>
        </div>
      ) : (
        <NFTGrid 
          nfts={nfts} 
          onSelectNFT={handleSelectNFT} 
        />
      )}
      
      {/* NFT details display */}
      {selectedNFT && (
        <div className="mt-8 p-4 border border-gray-700 rounded-lg bg-gray-900/50">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <img 
                src={selectedNFT.image} 
                alt={selectedNFT.name} 
                className="w-full h-auto object-contain rounded-lg"
                onError={(e) => e.target.src = defaultPlaceholder}
              />
            </div>
            <div className="md:w-2/3">
              <h2 className="text-xl font-bold mb-2">{selectedNFT.name}</h2>
              <p className="text-sm text-gray-400 mb-4">{selectedNFT.collectionName} #{selectedNFT.tokenId}</p>
              <p className="text-gray-300 mb-4">{selectedNFT.description}</p>
              <a 
                href={selectedNFT.openSeaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on OpenSea
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTWallet;