import { ethers } from 'ethers';
import contractABI from '../artifacts/contracts/PuzzleNFT.sol/PuzzleNFT.json';
import { uploadPuzzleToArweave, createPuzzleMetadata } from './arweave-uploader';

const CONTRACT_ADDRESS = '0x4725F266C295E729F29a295b8F0e560EDD9a28b2';
/**
 * Manages interactions with the PuzzleNFT contract
 */
export class PuzzleNFTManager {
  constructor(provider, contractAddress) {
    this.provider = provider;
    this.contractAddress = contractAddress;
    this.contract = new ethers.Contract(
      contractAddress,
      contractABI.abi,
      provider
    );
  }

  /**
   * Connect with a signer to perform transactions
   * @param {ethers.Signer} signer - Ethereum signer
   * @returns {PuzzleNFTManager} - Returns this for chaining
   */
  connect(signer) {
    this.signer = signer;
    this.contract = this.contract.connect(signer);
    return this;
  }

  /**
   * Complete process to create and mint a puzzle NFT
   * @param {string} imageUrl - URL of the puzzle image
   * @param {string} imageCID - IPFS CID of the puzzle image
   * @param {number} gridSize - Size of the puzzle grid
   * @returns {Promise<object>} - Transaction receipt and metadata
   */
  async createAndMintPuzzle(imageUrl, imageCID, gridSize) {
    try {
      // 1. Upload puzzle HTML to Arweave
      console.log('Uploading puzzle to Arweave...');
      const arweaveResult = await uploadPuzzleToArweave(imageUrl, gridSize);
      
      // 2. Create metadata with both IPFS and Arweave links
      console.log('Creating metadata...');
      const metadata = createPuzzleMetadata(imageCID, gridSize, arweaveResult.id);
      
      // 3. Upload metadata to IPFS
      console.log('Uploading metadata to IPFS...');
      const metadataURI = await this.uploadMetadataToIPFS(metadata);
      
      // 4. Mint the NFT
      console.log('Minting NFT...');
      const tx = await this.contract.safeMint(
        await this.signer.getAddress(),
        metadataURI,
        `puzzle-${gridSize}x${gridSize}-${arweaveResult.id.substring(0, 8)}`
      );
      
      // 5. Wait for transaction to be mined
      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      
      // 6. Return all relevant information
      return {
        receipt,
        tokenId: this.extractTokenIdFromReceipt(receipt),
        metadata,
        arweave: arweaveResult,
        metadataURI
      };
    } catch (error) {
      console.error('Error creating and minting puzzle:', error);
      throw error;
    }
  }
  
  /**
   * Upload metadata to IPFS
   * @param {object} metadata - Metadata object
   * @returns {Promise<string>} - IPFS URI
   */
  async uploadMetadataToIPFS(metadata) {
    // This function depends on your IPFS solution
    // Implementation examples:
    // - Using NFT.Storage
    // - Using Pinata
    // - Using your own IPFS node
    
    // For now, let's assume you have an API endpoint
    const response = await fetch('/api/upload-to-ipfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });
    
    const data = await response.json();
    return `ipfs://${data.cid}`;
  }
  
  /**
   * Record a puzzle solution on-chain
   * @param {number} tokenId - NFT token ID
   * @param {string} puzzleId - Unique puzzle ID
   * @param {number} moves - Number of moves taken to solve
   * @returns {Promise<object>} - Transaction receipt
   */
  async recordSolution(tokenId, puzzleId, moves) {
    const tx = await this.contract.recordSolution(tokenId, puzzleId, moves);
    return await tx.wait();
  }
  
  /**
   * Extract token ID from transaction receipt
   * @param {object} receipt - Transaction receipt
   * @returns {number} - Token ID
   */
  extractTokenIdFromReceipt(receipt) {
    // Look for the PuzzleMinted event
    const event = receipt.events.find(e => e.event === 'PuzzleMinted');
    if (event && event.args) {
      return event.args.tokenId.toNumber();
    }
    throw new Error('Could not extract token ID from receipt');
  }
}

/**
 * Deploy a new PuzzleNFT contract
 * @param {ethers.Signer} signer - Ethereum signer
 * @returns {Promise<string>} - Contract address
 */
export async function deployPuzzleNFTContract(signer) {
  const factory = new ethers.ContractFactory(
    contractABI.abi,
    contractABI.bytecode,
    signer
  );
  
  const contract = await factory.deploy();
  await contract.deployed();
  
  console.log(`PuzzleNFT deployed to: ${contract.address}`);
  return contract.address;
}