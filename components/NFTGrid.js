import React, { useState, useEffect } from 'react';
import ChainFilter from './ChainFilter';
import CollectionDropdown from './CollectionDropdown';
import SpamFilterToggle from './SpamFilterToggle';

const NFTGrid = ({ nfts, onSelectNFT }) => {
  const [selectedChain, setSelectedChain] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [showSpamNFTs, setShowSpamNFTs] = useState(false);
  const [displayedNFTs, setDisplayedNFTs] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 50; // Adjust based on your needs
  
  // Get the placeholder image
  const defaultPlaceholder = typeof window !== 'undefined' && window.NFT_PLACEHOLDER_IMAGE 
    ? window.NFT_PLACEHOLDER_IMAGE 
    : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

  // Image error handling
  const handleImageError = (e, nftItem) => {
    e.target.src = defaultPlaceholder;
  };

  // Filter NFTs based on all criteria
  useEffect(() => {
    // First, filter by chain and collection
    let filtered = nfts.filter(nft => {
      const chainMatch = selectedChain === 'all' || nft.chain === selectedChain;
      const collectionMatch = !selectedCollection || nft.collectionName === selectedCollection;
      const spamMatch = showSpamNFTs || !nft.isLikelyAirdrop;
      
      return chainMatch && collectionMatch && spamMatch;
    });
    
    // Reset pagination when filters change
    setPage(1);
    
    // Get the first page of results
    setDisplayedNFTs(filtered.slice(0, itemsPerPage));
  }, [nfts, selectedChain, selectedCollection, showSpamNFTs]);

  // Load more NFTs when scrolling
  const loadMoreNFTs = () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Get all filtered NFTs
    const filtered = nfts.filter(nft => {
      const chainMatch = selectedChain === 'all' || nft.chain === selectedChain;
      const collectionMatch = !selectedCollection || nft.collectionName === selectedCollection;
      const spamMatch = showSpamNFTs || !nft.isLikelyAirdrop;
      
      return chainMatch && collectionMatch && spamMatch;
    });
    
    // Calculate the next page
    const nextPage = page + 1;
    const newItems = filtered.slice(0, nextPage * itemsPerPage);
    
    // Update state
    setDisplayedNFTs(newItems);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    // Create observer to detect when we're near the bottom
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreNFTs();
        }
      },
      { threshold: 0.1 }
    );
    
    // Observe the sentinel element
    const sentinel = document.getElementById('nft-grid-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }
    
    // Cleanup observer
    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [displayedNFTs, selectedChain, selectedCollection, showSpamNFTs]);

  // Get NFTs for collection dropdown (filtered by chain only)
  const chainFilteredNfts = nfts.filter(nft => 
    (selectedChain === 'all' || nft.chain === selectedChain) && 
    (showSpamNFTs || !nft.isLikelyAirdrop)
  );

  // Get total count of matching NFTs
  const totalFilteredNFTs = nfts.filter(nft => {
    const chainMatch = selectedChain === 'all' || nft.chain === selectedChain;
    const collectionMatch = !selectedCollection || nft.collectionName === selectedCollection;
    const spamMatch = showSpamNFTs || !nft.isLikelyAirdrop;
    
    return chainMatch && collectionMatch && spamMatch;
  }).length;

  if (!nfts || nfts.length === 0) {
    return <p className="text-gray-400 text-center mt-4">No NFTs found. Connect your wallet to view your NFTs.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <ChainFilter 
            nfts={nfts} 
            showSpamNFTs={showSpamNFTs}
            onFilterChange={setSelectedChain} 
          />
        </div>
        <div className="md:w-1/3">
          <CollectionDropdown 
            nfts={chainFilteredNfts} 
            onSelectCollection={setSelectedCollection} 
          />
        </div>
        <div className="md:w-1/3 flex items-end">
          <SpamFilterToggle 
            showSpamNFTs={showSpamNFTs} 
            setShowSpamNFTs={setShowSpamNFTs} 
          />
        </div>
      </div>
      
      <div className="text-sm text-gray-400">
        Showing {displayedNFTs.length} of {totalFilteredNFTs} NFTs
      </div>
      
      {displayedNFTs.length === 0 ? (
        <p className="text-gray-400 text-center mt-4">No NFTs found with the selected filters.</p>
      ) : (
        <div className="relative">
          <div className="h-[500px] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {displayedNFTs.map((nft, index) => {
                // Ensure we have a valid image URL or fallback to our placeholder
                const imageUrl = nft.image || nft.tokenURI || defaultPlaceholder;
                const collectionName = nft.collectionName || "Unknown Collection";
                const tokenId = nft.tokenId || "N/A";
                const name = nft.name || `NFT #${tokenId}`;
                
                // Add chain indicator
                const chainBadge = {
                  ethereum: "bg-blue-900/50",
                  matic: "bg-purple-900/50",
                  base: "bg-blue-600/50"
                }[nft.chain] || "bg-gray-700/50";

                return (
                  <div key={`${nft.id || index}`} 
                    className={`cursor-pointer border rounded-lg p-2 hover:bg-gray-800 relative ${
                      nft.isLikelyAirdrop ? 'border-yellow-600/30' : 'border-gray-700'
                    }`}
                    onClick={() => {
                      console.log("NFT selected:", nft);
                      onSelectNFT(nft);
                    }}
                  >
                    <div className={`absolute top-3 right-3 ${chainBadge} rounded-full px-2 py-0.5 text-xs`}>
                      {nft.chainDisplayName}
                    </div>
                    
                    {nft.isLikelyAirdrop && (
                      <div className="absolute top-3 left-3 bg-yellow-600/70 rounded-full px-2 py-0.5 text-xs">
                        Likely Airdrop
                      </div>
                    )}
                    
                    <div className="aspect-square bg-gray-900 rounded flex items-center justify-center overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={name} 
                        onError={(e) => handleImageError(e, nft)} 
                        className="w-full h-full object-contain" 
                        loading="lazy" // Improve performance
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-300 font-medium truncate">{name}</p>
                    <p className="text-xs text-gray-500 truncate">{collectionName} #{tokenId}</p>
                  </div>
                );
              })}
            </div>
            
            {/* Sentinel element for infinite scrolling */}
            <div id="nft-grid-sentinel" className="h-10"></div>
            
            {/* Loading more indicator */}
            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTGrid;