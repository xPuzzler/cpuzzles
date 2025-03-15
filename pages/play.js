import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useReadContract } from 'wagmi';
import { http } from 'viem';
import { createPublicClient } from 'viem';
import { base, baseGoerli } from 'wagmi/chains';

import PuzzleCanvas from '../components/PuzzleCanvas';
import Confetti from '../components/Confetti';

// Replace with your Highlight.xyz contract address
const CONTRACT_ADDRESS = '0x448CE2682db71C9192970B9b22357fa4c70e444f';

// ABI for the Highlight.xyz contract's tokenURI function
const HIGHLIGHT_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
];

export default function Play() {
  const router = useRouter();
  const { tokenId } = router.query;
  
  const [metadata, setMetadata] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [gridSize, setGridSize] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Use wagmi's useReadContract hook to get tokenURI
  const { data: tokenURI, isError, isLoading: isTokenURILoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: HIGHLIGHT_ABI,
    functionName: 'tokenURI',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId, // Only run query when tokenId is available
    }
  });
  
  useEffect(() => {
    if (!tokenURI) return;
    
    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        
        // Format the metadata URL
        let metadataUrl = tokenURI;
        if (tokenURI.startsWith('ipfs://')) {
          metadataUrl = `https://ipfs.io/ipfs/${tokenURI.slice(7)}`;
        }
        
        const response = await fetch(metadataUrl);
        const data = await response.json();
        
        setMetadata(data);
        
        // Get the image URL
        let imgUrl = data.image;
        if (imgUrl.startsWith('ipfs://')) {
          imgUrl = `https://ipfs.io/ipfs/${imgUrl.slice(7)}`;
        }
        
        setImageUrl(imgUrl);
        
        // Get the grid size from attributes
        const gridSizeAttribute = data.attributes.find(attr => attr.trait_type === 'Grid Size');
        if (gridSizeAttribute) {
          const size = parseInt(gridSizeAttribute.value.split('x')[0]);
          setGridSize(size);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setError('Failed to load puzzle metadata. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchMetadata();
  }, [tokenURI]);
  
  // Handle errors from the contract read
  useEffect(() => {
    if (isError) {
      setError('Failed to load puzzle data from the blockchain. Please try again later.');
      setIsLoading(false);
    }
  }, [isError]);
  
  // Handle puzzle solved
  const handlePuzzleSolved = () => {
    setPuzzleSolved(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };
  
  // Handle going back to home
  const handleGoHome = () => {
    router.push('/');
  };
  
  if (isLoading || isTokenURILoading) {
    return (
      <div className="loading-container">
        <h2>Loading puzzle...</h2>
        <div className="loader"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleGoHome}>Go Back Home</button>
      </div>
    );
  }
  
  return (
    <div className="container">
      <Head>
        <title>{metadata?.name || 'Interactive Puzzle NFT'}</title>
        <meta name="description" content={metadata?.description || 'An interactive puzzle NFT'} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Confetti active={showConfetti} />
      
      <header>
        <h1>{metadata?.name || 'Interactive Puzzle NFT'}</h1>
        <button onClick={handleGoHome} className="home-button">Home</button>
      </header>
      
      <main>
        <div className="puzzle-details">
          <p>{metadata?.description}</p>
          
          {metadata?.attributes && (
            <div className="attributes">
              {metadata.attributes.map((attr, index) => (
                <div key={index} className="attribute">
                  <span className="attribute-name">{attr.trait_type}:</span>
                  <span className="attribute-value">{attr.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="puzzle-container">
          {imageUrl && (
            <PuzzleCanvas 
              imageUrl={imageUrl} 
              gridSize={gridSize} 
              onSolved={handlePuzzleSolved}
              canvasWidth={400}
              canvasHeight={400}
              interactive={true}
            />
          )}
        </div>
        
        {puzzleSolved && (
          <div className="solved-message">
            <h2>Congratulations!</h2>
            <p>You solved the puzzle!</p>
          </div>
        )}
      </main>
      
      <footer>
        <p>Puzzle NFT Viewer &copy; {new Date().getFullYear()}</p>
      </footer>
      
      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #eaeaea;
        }
        
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 0;
        }
        
        footer {
          width: 100%;
          height: 60px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .puzzle-details {
          width: 100%;
          max-width: 800px;
          margin-bottom: 2rem;
        }
        
        .attributes {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 1rem;
        }
        
        .attribute {
          background: #f0f0f0;
          padding: 5px 10px;
          border-radius: 5px;
        }
        
        .attribute-name {
          font-weight: bold;
          margin-right: 5px;
        }
        
        .puzzle-container {
          margin: 1rem auto;
          display: flex;
          justify-content: center;
        }
        
        .solved-message {
          margin-top: 2rem;
          text-align: center;
          padding: 1rem;
          background: #e6f7ff;
          border-radius: 5px;
          animation: fadeIn 0.5s ease;
        }
        
        .home-button {
          padding: 8px 16px;
          background: #1890ff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        
        .loader {
          border: 5px solid #f3f3f3;
          border-radius: 50%;
          border-top: 5px solid #1890ff;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-top: 20px;
        }
        
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}