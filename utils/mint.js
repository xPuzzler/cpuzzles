import { getAccount } from '@wagmi/core';
import { createPublicClient, http, parseAbi } from 'viem';
import { simulateContract, writeContract, readContract } from '@wagmi/core';
import { parseEther, encodeFunctionData } from 'viem';
import { useChainId } from 'wagmi';
import { base, baseSepolia } from 'viem/chains';
import { CONTRACT_ADDRESSES, SUPPORTED_CHAINS, isChainSupported } from './constants';
import axios from 'axios';
import { getWalletClient, getPublicClient } from '@wagmi/core';
import { useAccount, useChainId, useWriteContract, usePrepareContractWrite } from 'wagmi';
import { ethers } from 'ethers';
import { BrowserProvider, Contract } from "ethers";
import { getContractAddress } from './contract';

const MINT_PRICE = 0.001; // in ETH
export const MAX_PER_WALLET = 25;
const CONTRACT_ADDRESS = '0x448CE2682db71C9192970B9b22357fa4c70e444f';

// Check if we're in development mode
const isDev = false;


const PUZZLE_NFT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "metadataURI", "type": "string"},
      {"internalType": "uint256", "name": "gridSize", "type": "uint256"},
      {"internalType": "string", "name": "contentHash", "type": "string"},
      {"internalType": "string", "name": "resolverHash", "type": "string"},
      {"internalType": "uint256", "name": "completionReward", "type": "uint256"}
    ],
    "name": "mintPuzzle",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "owner","type": "address"}],
    "name": "mintCount",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "type": "event",
    "name": "PuzzleMinted",
    "inputs": [
      {"indexed": true, "name": "minter", "type": "address"},
      {"indexed": false, "name": "tokenId", "type": "uint256"}
    ]
  }
];

// Create the public client
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

/**
 * Stores the mapping between resolver hash and token ID
 */
const storeHashMapping = async (resolverHash, tokenId) => {
  if (isDev) {
    console.log(`DEV MODE: Storing hash mapping: ${resolverHash} -> ${tokenId}`);
    return;
  }
  
  // Implementation depends on your storage method
  console.log(`Storing hash mapping: ${resolverHash} -> ${tokenId}`);
  // Could be a database call, local storage, etc.
};

/**
 * Mints a new Puzzle NFT
 */
export const useMintPuzzleNFT = (metadataUrl, gridSize) => {
  const { address } = useAccount();
  const chainId = useChainId();
  
  const chainId = chain?.id;
  const contractAddress = chainId ? CONTRACT_ADDRESSES[chainId] : undefined;
  
  const resolver_hash = "";
  
  const { config } = usePrepareContractWrite({
    address: contractAddress,
    abi: PUZZLE_NFT_ABI,
    functionName: 'mintPuzzle',
    args: [metadataUrl, gridSize, resolver_hash],
    value: parseEther(MINT_PRICE.toString()),
    enabled: !!contractAddress && !!address && !!metadataUrl && !!gridSize
  });
  
  const { write, data, isLoading, isSuccess, isError, error } = useWriteContract(config);
  
  // Return everything needed for the minting operation
  return {
    mint: write,
    transaction: data,
    isLoading,
    isSuccess,
    isError,
    error,
    address,
    chainId,
    contractAddress
  };
};

// And if you need a standalone function that doesn't use hooks:
export const mintPuzzleNFT = async (metadataUrl, gridSize, chainId, userAddress) => {
  try {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }

    // Validate input parameters
    if (!metadataUrl || !gridSize || !chainId) {
      throw new Error("Missing required parameters");
    }

    console.log('Input validation:', {
      metadataUrl,
      gridSize: Number(gridSize),
      chainId,
      userAddress
    });

    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      throw new Error(`No contract address configured for chain ID ${chainId}. Please switch to Base Sepolia.`);
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Ensure we have enough funds
    const balance = await provider.getBalance(await signer.getAddress());
    const mintPrice = parseEther(MINT_PRICE.toString());
    
    if (balance < mintPrice) {
      throw new Error(`Insufficient funds. Need ${MINT_PRICE} ETH`);
    }

    const contract = new Contract(
      contractAddress,
      PUZZLE_NFT_ABI,
      signer
    );

    // Add empty string for contentHash parameter
    const contentHash = "";

    // Format parameters exactly as contract expects
    const tx = await contract.mintPuzzle(
      metadataUrl,
      Number(gridSize),
      contentHash,
      contentHash, // resolver hash
      mintPrice, // completion reward (same as mint price for now)
      {
        value: mintPrice,
        gasLimit: 500000 // Set explicit gas limit
      }
    );

    console.log('Transaction sent:', tx.hash);
    
    const receipt = await tx.wait(1); // Wait for 1 confirmation
    console.log('Transaction receipt:', receipt);

    // Find the PuzzleCreated event
    const event = receipt.logs
      .map(log => {
        try {
          return contract.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .find(event => event && event.name === 'PuzzleCreated');

    return {
      success: true,
      hash: tx.hash,
      tokenId: event?.args?.tokenId?.toString()
    };

  } catch (error) {
    console.error("Mint error details:", {
      message: error.message,
      code: error.code,
      transaction: error.transaction,
      data: error.data,
      method: error.method,
      stack: error.stack
    });
    
    // Enhanced error handling
    let errorMessage = "Transaction failed";
    
    if (error.message.includes("insufficient funds")) {
      errorMessage = `Insufficient funds. Need ${MINT_PRICE} ETH`;
    } else if (error.message.includes("user rejected")) {
      errorMessage = "Transaction was rejected by user";
    } else if (error.message.includes("missing revert data")) {
      errorMessage = "Contract call failed - please check parameters and try again";
    }

    return {
      success: false,
      error: errorMessage,
      hash: error.transaction?.hash
    };
  }
};

// Add this helper function if not already present
function extractCustomError(error) {
  const errorString = error.toString();
  
  if (errorString.includes("insufficient funds")) {
    return "Insufficient funds to pay for the mint";
  }
  
  if (errorString.includes("execution reverted")) {
    const reasonMatch = errorString.match(/reason="([^"]+)"/);
    return reasonMatch?.[1] || "Transaction failed during execution";
  }
  
  if (errorString.includes("missing revert data")) {
    return "Transaction would fail - check your wallet has enough ETH and the contract is active";
  }
  
  return null;
}

export const getMintPrice = () => MINT_PRICE;

/**
 * Gets remaining mints for an address
 */
export const getRemainingMints = async (address, chainId) => {
  try {
    // Validate parameters
    if (!address || !chainId) {
      console.log("Missing address or chainId:", { address, chainId });
      return 0;
    }
    
    // Log what we're trying to do for debugging
    console.log("Attempting to get mint count for:", { 
      address, 
      chainId, 
      contractAddress: CONTRACT_ADDRESSES[chainId] 
    });

    // Try to get mint count from local storage
    const storageKey = `${address.toLowerCase()}_${chainId}_mintCount`;
    const storedMintCount = localStorage.getItem(storageKey);
    const mintCount = storedMintCount ? parseInt(storedMintCount) : 0;
    
    console.log(`User has minted ${mintCount} puzzles so far`);
    return MAX_PER_WALLET - mintCount;
    
    /* Commented out problematic contract call for now */
  } catch (error) {
    console.error("Remaining mints error:", error);
    return MAX_PER_WALLET; // Default to max mints on error
  }
};

/**
 * Gets puzzle details from the contract
 */
export const getPuzzleDetails = async (contractAddress, tokenId) => {
  try {
    // For development purposes, returning mock data
    return {
      imageUrl: `https://picsum.photos/seed/${tokenId}/600/400`,  // Random image based on tokenId
      creator: '0x1234567890123456789012345678901234567890',
      gridSize: 3,
      completed: false
    };
  } catch (error) {
    console.error('Error getting puzzle details:', error);
    throw error;
  }
};

/**
 * Gets all puzzles created by a specific user
 */
export const getUserPuzzles = async (contractAddress, userAddress) => {
  try {
    // For development purposes, returning mock data
    return [
      {
        tokenId: 1,
        imageUrl: 'https://picsum.photos/seed/1/600/400',
        creator: userAddress,
        gridSize: 3,
        completed: false
      },
      {
        tokenId: 2,
        imageUrl: 'https://picsum.photos/seed/2/600/400',
        creator: userAddress,
        gridSize: 4,
        completed: true
      }
    ];
  } catch (error) {
    console.error('Error getting user puzzles:', error);
    throw error;
  }
};

/**
 * Gets all available puzzles from the contract
 */
export const getAllPuzzles = async (contractAddress) => {
  try {
    // For development purposes, returning mock data
    return [
      {
        tokenId: 1,
        imageUrl: 'https://picsum.photos/seed/1/600/400',
        creator: '0x1234567890123456789012345678901234567890',
        gridSize: 3,
        completed: false
      },
      {
        tokenId: 2,
        imageUrl: 'https://picsum.photos/seed/2/600/400',
        creator: '0x2345678901234567890123456789012345678901',
        gridSize: 4,
        completed: true
      },
      {
        tokenId: 3,
        imageUrl: 'https://picsum.photos/seed/3/600/400',
        creator: '0x3456789012345678901234567890123456789012',
        gridSize: 5,
        completed: false
      }
    ];
  } catch (error) {
    console.error('Error getting all puzzles:', error);
    throw error;
  }
};