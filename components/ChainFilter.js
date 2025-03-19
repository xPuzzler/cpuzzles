import React, { useState, useEffect } from 'react';

const ChainFilter = ({ nfts, onFilterChange, showSpamNFTs }) => {
  const [selectedChain, setSelectedChain] = useState('all');
  const [chainCounts, setChainCounts] = useState({});
  
  // Configure available chains
  const availableChains = [
    { id: 'all', displayName: 'All Chains' },
    { id: 'ethereum', displayName: 'Ethereum' },
    { id: 'matic', displayName: 'Polygon' },
    { id: 'base', displayName: 'Base' }
  ];
  
  // Calculate chain counts considering spam filter
  useEffect(() => {
    const counts = {};
    
    availableChains.forEach(chain => {
      if (chain.id === 'all') {
        counts[chain.id] = nfts.filter(nft => showSpamNFTs || !nft.isLikelyAirdrop).length;
      } else {
        counts[chain.id] = nfts.filter(nft => 
          nft.chain === chain.id && (showSpamNFTs || !nft.isLikelyAirdrop)
        ).length;
      }
    });
    
    setChainCounts(counts);
  }, [nfts, showSpamNFTs]);
  
  const handleChainSelect = (chainId) => {
    setSelectedChain(chainId);
    onFilterChange(chainId);
  };
  
  return (
    <div className="mb-4">
      <div className="mb-2 text-sm text-gray-400">Filter by Blockchain</div>
      <div className="flex flex-wrap gap-2">
        {availableChains.map((chain) => (
          <button
            key={chain.id}
            onClick={() => handleChainSelect(chain.id)}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${
              selectedChain === chain.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {chain.displayName}
            <span className="text-xs opacity-80">
              ({chainCounts[chain.id] || 0})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChainFilter;