import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import Link from 'next/link';

import WalletConnect from '../components/WalletConnect';
import PuzzleGenerator from '../components/PuzzleGenerator';
import { Puzzle, ExternalLink } from 'lucide-react';
import NFTMirror from '../components/NFTFetcher';
import CollectionDropdown from '../components/CollectionDropdown';
import NFTGrid from '../components/NFTGrid';
import { Sun, Moon } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('create');
  const [mounted, setMounted] = useState(false);
  const [nfts, setNFTs] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [filteredNFTs, setFilteredNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize default placeholder for consistency
  const defaultPlaceholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
  
  // Make placeholder available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.NFT_PLACEHOLDER_IMAGE = defaultPlaceholder;
    }
  }, []);

  useEffect(() => {
    console.log("Total NFTs in state:", nfts.length);
    
    if (selectedCollection === '') {
      console.log("No collection selected, showing all NFTs");
      setFilteredNFTs(nfts);
    } else {
      console.log("Filtering by collection:", selectedCollection);
      const filtered = nfts.filter(nft => nft.collectionName === selectedCollection);
      console.log("Filtered NFTs:", filtered.length);
      setFilteredNFTs(filtered);
    }
  }, [nfts, selectedCollection]);

  const handleCollectionSelect = (collection) => {
    console.log("Collection selected:", collection);
    setSelectedCollection(collection);
  };

  useEffect(() => {
    if (nfts.length > 0) {
      console.log("Sample NFT object structure:", nfts[0]);
      console.log("Collection names in NFTs:", nfts.slice(0, 10).map(nft => nft.collectionName));
    }
  }, [nfts]);

  const handleNFTSelect = (nft) => {
    console.log("Selected NFT in handleNFTSelect:", nft);
    
    // Ensure the NFT object has all required fields
    const enhancedNFT = {
      ...nft,
      image: nft.image || defaultPlaceholder,
      collectionName: nft.collectionName || "Unknown Collection",
      tokenId: nft.tokenId || "N/A",
      name: nft.name || `NFT #${nft.tokenId || "Unknown"}`,
      contractAddress: nft.contractAddress || "",
      chain: nft.chain || "ethereum",
      chainDisplayName: nft.chainDisplayName || nft.chain || "Ethereum",
      openSeaUrl: nft.openSeaUrl || `https://opensea.io/assets/${nft.chain || 'ethereum'}/${nft.contractAddress}/${nft.tokenId}`
    };
    
    setSelectedNFT(enhancedNFT); // Update state with enhanced NFT
  };

  useEffect(() => {
    // Debug log when selectedNFT changes
    console.log("Selected NFT state updated:", selectedNFT);
  }, [selectedNFT]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  if (!mounted) return null;
  
  return (
    <div className="container">
      <Head>
        <title>CryptoPuzzle</title>
        <meta name="description" content="Create and play with interactive puzzle NFTs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
<header className="flex justify-between items-center py-4">
  <div className="flex items-center space-x-2">
    <div className="logo-gradient w-10 h-10 rounded-lg flex items-center justify-center ml-8">
      <Puzzle className="text-white" size={24} />
    </div>
    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
      CryptoPuzzle
    </h1>
  </div>

  <div className="wallet-connect">
  <WalletConnect className="btn-primary" />
</div>
</header>

{/* Hero Section with improved responsiveness */}
<section className="hero text-center my-6 md:my-12 relative py-10 md:py-20 px-4">
  <div className="relative z-10 max-w-4xl mx-auto">
    <h2 
      className="typing-effect mb-2 md:mb-4 mx-auto" 
      style={{ fontFamily: 'ABC Puzzle' }}
    >
      TURN YOUR NFTs INTO PUZZLES
    </h2>
    <p className="text-gray-300 max-w-xs sm:max-w-md md:max-w-2xl mx-auto mb-4">
      One click and your NFTs are now puzzles.<br />
      Fun, addictive, and ready to challenge!
    </p>
  </div>

  {/* Puzzle-like Background Pattern */}
  <div className="absolute top-0 left-0 w-full h-full bg-puzzle-pattern bg-cover bg-center opacity-30"></div>
</section>
<section 
  className={`relative rounded-2xl p-6 transition-all duration-500 overflow-hidden animate-fadeIn ${ 
    isDarkMode 
      ? 'bg-gray-800/60 border border-gray-700 shadow-[0_0_20px_rgba(138,92,246,0.9)]' 
      : 'bg-white/80 border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.1)]'
  }`}>
  <div className="container mx-auto px-0">

    {/* Theme Toggle Button */}
    <button 
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="absolute top-4 right-4 p-3 rounded-full transition-all duration-500 hover:scale-105 cursor-pointer"
      style={{
        background: isDarkMode 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0,0,0,0.1)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: isDarkMode 
          ? '0 0 20px rgba(255,255,255,0.15)' 
          : '0 0 20px rgba(0,0,0,0.15)',
        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        width: '56px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="transition-all duration-500 transform" 
        style={{
          opacity: isDarkMode ? 1 : 0,
          position: 'absolute',
          transform: isDarkMode ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-90deg)'
        }}>
        <Sun className="text-yellow-300" size={32} />
      </div>
      <div className="transition-all duration-500 transform"
        style={{
          opacity: isDarkMode ? 0 : 1,
          position: 'absolute',
          transform: isDarkMode ? 'scale(0.5) rotate(90deg)' : 'scale(1) rotate(0deg)'
        }}>
        <Moon className="text-indigo-700" size={32} />
      </div>
    </button>

    <NFTMirror walletAddress={address} setNFTs={setNFTs} setIsLoading={setIsLoading} />

    {/* NFT Grid - Now Full Width */}
    <div className="w-full p-2">
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-t-blue-500 border-gray-600 rounded-full mb-2"></div>
            <p className="text-gray-400">Loading your NFTs...</p>
          </div>
        </div>
      ) : (
        <NFTGrid nfts={filteredNFTs} onSelectNFT={handleNFTSelect} />
      )}
    </div>
  </div>
</section>

      {/* Puzzle Generator */}
      <main className="flex-grow">
        <div className="tab-content w-full max-w-7xl mx-auto">
          <div className="create-puzzle">
            {isConnected ? (
              <div className="puzzle-container relative group">
                  {/* Pass selectedNFT explicitly */}
                  <PuzzleGenerator nft={selectedNFT} />
                </div>
            ) : (
              <div className="connect-prompt text-center p-8 bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl">
                <p className="text-gray-400 text-lg">Please connect your wallet to create puzzle NFTs</p>
              </div>
            )}
          </div>
        </div>
      </main>

      
      
      <style jsx global>{`
        body {
          background:rgb(0, 0, 0);
          color: white;
        }
        
        .container {
          min-height: 100vh;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
        }
        
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 0;
          border-bottom: 1px solid #2d2d2d;
        }
        
        main {
          flex: 1;
          padding: 2rem 1rem;
        }

        .puzzle-container {
          width: 100%;
          border-radius: 1rem;
          transition: all 0.3s ease;
        }

        .puzzle-container:hover {
          border-color: rgba(0, 0, 0, 0.2);
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
        }

        .puzzle-container .relative {
          isolation: isolate;
        }

        .logo-gradient {
          background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
        }
        
        .tab {
          transition: all 0.3s ease;
        }

        .hero {
    position: relative;
    padding: 100px 0;
    overflow: hidden;
  }

  .bg-puzzle-pattern {
    background-image: url('/puzzle-pattern.png');
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.40;
    z-index: 0; 
  }

  h2 {
    font-size: 2rem;
    background: linear-gradient(to right, #9333ea, #06b6d4);
  -webkit-background-clip: text;  /* Ensures the gradient applies to text */
  -webkit-text-fill-color: transparent;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 2.2rem;
    background: linear-gradient(to right, #9333ea, #06b6d4,  #9333ea);
  -webkit-background-clip: text;  /* Ensures the gradient applies to text */
  -webkit-text-fill-color: transparent;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  h4 {
    font-size: 1.5rem;
    background: linear-gradient(to right, #9333ea, #06b6d4,  #9333ea);
  -webkit-background-clip: text;  /* Ensures the gradient applies to text */
  -webkit-text-fill-color: transparent;
    font-weight: normal;
    margin-bottom: 1rem;
  }

  p {
  font-size: 1.5rem;
     background: linear-gradient(to right, #06b6d4, #9333ea);
  -webkit-background-clip: text;  /* Ensures the gradient applies to text */
  -webkit-text-fill-color: transparent;
    max-width: 40rem;
    font-weight: bold;
    margin: 0 auto;
  }


.hero h2, .hero p {
    transform: none;
  }
    .typing-effect {
    display: inline-block;
    font-family: 'ABC Puzzle', sans-serif;
    font-weight: 400;
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    color: #f3f3f3;
    white-space: nowrap;
    overflow: hidden;
    border-right: 4px solid transparent;
    animation: typing 3s steps(30) 1s forwards, blink 0.75s step-end infinite;
    background: linear-gradient(to right, #9333ea, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    max-width: 100%;
    margin-left: 0;
    transform: none;
  }

    @keyframes typing {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }

  @keyframes blink {
    50% {
      border-color: transparent;
    }
  }
    @font-face {
  font-family: 'ABC Puzzle';
  src: url('/fonts/abc-puzzle.ttf') format('truetype'); /* Adjust the filename based on your file */
  font-weight: normal;
  font-style: normal;
}
  .btn-primary {
  background: linear-gradient(to right, #9333ea, #06b6d4);
  color: #fff;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.8rem; 
  transition: transform 0.2s ease, background 0.2s ease;
  z-index: -10;
}

.btn-primary:hover {
  background: linear-gradient(to right, #06b6d4), #9333ea);
  transform: scale(1.02);
}


/* Ensure body and html take up the full height of the page */
html, body {
  height: 100%;
  margin: 0;
}

/* Main container to use flexbox layout */
.main-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Take up the full height of the page */
}

/* Ensure footer stays at the bottom */
footer {
  margin-top: auto; /* Pushes the footer to the bottom */
}

@media (max-width: 768px) {
    .hero h2, .hero p {
      transform: none;
    }
    
    p {
      font-size: clamp(1rem, 4vw, 1.5rem);
    }
  }
  
      `}</style>
    </div>
  );
}