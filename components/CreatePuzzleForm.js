import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAccount, useBalance } from 'wagmi';
import { uploadImageToIPFS, createPuzzleMetadata, uploadMetadataToIPFS } from '../utils/ipfs';
import { mintPuzzleNFT, getMintPrice, getRemainingMints, MAX_PER_WALLET } from '../utils/mint';
import PuzzlePreview from './PuzzlePreview';
import PuzzleGenerator from './PuzzleGenerator'; 
import { useChainId } from 'wagmi';

const CONTRACT_ADDRESS = '0x4725F266C295E729F29a295b8F0e560EDD9a28b2';

const CreatePuzzleForm = () => {
  const chainId = useChainId();
  const router = useRouter();
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  
  // State management
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gridSize, setGridSize] = useState(3);
  const [mintPrice, setMintPrice] = useState(0);
  const [remainingMints, setRemainingMints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState(null);
  

  useEffect(() => {
    if (address) {
      getRemainingMints(address).then(setRemainingMints);
      setMintPrice(getMintPrice());
    }
  }, [address]);
  
  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    if (!image) {
      setError('Please select an image.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // 1. Upload image to IPFS
      const imageUrl = await uploadImageToIPFS(image);
      console.log('Image uploaded to IPFS:', imageUrl);
      
      // 2. Create metadata
      const metadata = createPuzzleMetadata(imageUrl, gridSize, address);
      
      // 3. Upload metadata to IPFS
      const metadataUrl = await uploadMetadataToIPFS(metadata);
      console.log('Metadata uploaded to IPFS:', metadataUrl);
      
      // 4. Mint NFT
      const result = await mintPuzzleNFT(metadataUrl, gridSize, chainId);
      console.log('NFT minted successfully:', result);
      
      setMintedTokenId(result.tokenId);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Error creating puzzle NFT:', err);
      setError('Failed to create puzzle NFT. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle view puzzle
  const handleViewPuzzle = () => {
    router.push(`/play?tokenId=${mintedTokenId}`);
  };
  
  return (
    <div className="create-puzzle-form">
      {success ? (
        <div className="success-container">
          <h3>Puzzle NFT Created Successfully!</h3>
          <p>Your puzzle NFT has been minted with token ID: {mintedTokenId}</p>
          <button onClick={handleViewPuzzle} className="view-button">
            View Your Puzzle
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="image">Upload Image:</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="upload-input"
            />
            
            {imagePreview && (
  <div className="preview-section">
    <h4 className="preview-title">Interactive Preview</h4>
    <PuzzleGenerator 
      image={image}
      gridSize={gridSize}
      onGridChange={setGridSize}
    />
    
    <h4 className="preview-title">NFT Preview</h4>
    <PuzzlePreview 
      imageUrl={imagePreview}
      gridSize={gridSize}
      onGridChange={setGridSize}
    />
  </div>
            )}
          </div>
  
          <div className="form-group grid-selector">
            <label htmlFor="gridSize">Grid Size:</label>
            <select
              id="gridSize"
              value={gridSize}
              onChange={(e) => setGridSize(parseInt(e.target.value))}
              required
              className="grid-select"
            >
              <option value="2">2x2</option>
              <option value="3">3x3</option>
              <option value="4">4x4</option>
              <option value="5">5x5</option>
            </select>
          </div>
  
          <div className="mint-info-card">
            <div className="mint-info-item">
              <span className="mint-label">Mint Price:</span>
              <span className="mint-value">{mintPrice} ETH</span>
            </div>
            <div className="mint-info-item">
              <span className="mint-label">Remaining Mints:</span>
              <span className="mint-value">{remainingMints}/{MAX_PER_WALLET}</span>
            </div>
            <div className="mint-info-item">
              <span className="mint-label">Your Balance:</span>
              <span className="mint-value">{balance?.formatted} ETH</span>
            </div>
          </div>
  
          {error && <div className="error-message">{error}</div>}
  
          <button 
            type="submit" 
            disabled={loading || remainingMints <= 0} 
            className="mint-button"
          >
            {loading ? (
              <span className="loading-text">
                <span className="spinner"></span>
                Minting...
              </span>
            ) : (
              `Mint Now (${mintPrice} ETH)`
            )}
          </button>
        </form>
      )}
  
      <style jsx>{`
        .create-puzzle-form {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }
  
        .upload-input {
          display: block;
          margin: 1rem 0;
          padding: 0.5rem;
          border: 2px dashed #6366f1;
          border-radius: 12px;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s ease;
        }
  
        .upload-input:hover {
          border-color: #8b5cf6;
          background: rgba(99, 102, 241, 0.05);
        }
  
        .preview-section {
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
  
        .preview-title {
          color: #e0e0e0;
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
        }
  
        .grid-selector {
          margin: 2rem 0;
        }
  
        .grid-select {
          display: block;
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          margin-top: 0.5rem;
        }
  
        .mint-info-card {
          background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2rem 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
  
        .mint-info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
  
        .mint-label {
          color: #a0a0a0;
        }
  
        .mint-value {
          color: #e0e0e0;
          font-weight: 500;
        }
  
        .mint-button {
          width: 100%;
          padding: 1.25rem;
          background: linear-gradient(45deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
  
        .mint-button:disabled {
          background: #4a4a4a;
          cursor: not-allowed;
          opacity: 0.7;
        }
  
        .mint-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
  
        .loading-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
  
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }
  
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
  
        .error-message {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          border: 1px solid rgba(255, 107, 107, 0.2);
        }
  
        .success-container {
          text-align: center;
          padding: 3rem;
          background: rgba(40, 167, 69, 0.1);
          border-radius: 16px;
          border: 1px solid rgba(40, 167, 69, 0.2);
        }
  
        .view-button {
          background: #28a745;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          margin-top: 1.5rem;
          transition: all 0.3s ease;
        }
  
        .view-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }
      `}</style>
    </div>
  );
};

export default CreatePuzzleForm;