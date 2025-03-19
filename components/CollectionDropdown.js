import React, { useEffect, useState } from 'react';

const CollectionDropdown = ({ nfts, onSelectCollection }) => {
  const [collections, setCollections] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    if (!nfts || nfts.length === 0) {
      setCollections([]);
      return;
    }

    // Extract unique collection names
    const uniqueCollections = [...new Set(nfts.map(nft => nft.collectionName || "Unknown Collection"))];
    
    // Sort collections alphabetically
    uniqueCollections.sort();
    
    console.log("Available collections:", uniqueCollections);
    setCollections(uniqueCollections);
  }, [nfts]);

  const handleSelect = (collection) => {
    setSelected(collection);
    onSelectCollection(collection);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelected('');
    onSelectCollection('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="mb-2 text-sm text-gray-400">Filter by Collection</div>
      <div className="relative">
        <button
          className="w-full flex items-center justify-between px-4 py-2 text-left bg-black/50 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">
            {selected || "All Collections"}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
            <ul>
              <li
                className="px-4 py-2 hover:bg-gray-800 cursor-pointer border-b border-gray-700"
                onClick={handleClear}
              >
                All Collections
              </li>
              {collections.map((collection, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-800 cursor-pointer truncate"
                  onClick={() => handleSelect(collection)}
                >
                  {collection}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Display NFT Count */}
      {nfts && nfts.length > 0 && (
        <div className="mt-4 text-sm text-gray-400">
          {selected ? 
            `Showing ${nfts.filter(nft => nft.collectionName === selected).length} NFTs` :
            `Showing all ${nfts.length} NFTs`
          }
        </div>
      )}
    </div>
  );
};

export default CollectionDropdown;