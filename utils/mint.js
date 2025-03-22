import { getAccount } from '@wagmi/core';
import { createPublicClient, http, parseAbi } from 'viem';
import { simulateContract, writeContract, readContract } from '@wagmi/core';
import { parseEther, encodeFunctionData } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { CONTRACT_ADDRESSES, SUPPORTED_CHAINS, isChainSupported } from './constants';
import axios from 'axios';
import { getWalletClient, getPublicClient } from '@wagmi/core';
import { useAccount, useChainId, useWriteContract, usePrepareContractWrite } from 'wagmi';
import { ethers } from 'ethers';
import { getContractAddress } from './contract';

const MINT_PRICE = 0.001; // in ETH
export const MAX_PER_WALLET = 50;
const CONTRACT_ADDRESS = '0x4725F266C295E729F29a295b8F0e560EDD9a28b2';

const isDev = false;

export const PUZZLE_NFT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "newBaseURI",
        "type": "string"
      }
    ],
    "name": "BaseURIUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_fromTokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_toTokenId",
        "type": "uint256"
      }
    ],
    "name": "BatchMetadataUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "MetadataUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "PuzzleCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gridSize",
        "type": "uint256"
      }
    ],
    "name": "PuzzleCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "locked",
        "type": "bool"
      }
    ],
    "name": "PuzzleLocked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RewardClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "percentage",
        "type": "uint256"
      }
    ],
    "name": "RoyaltyUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "whitelisted",
        "type": "bool"
      }
    ],
    "name": "WhitelistUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_PER_WALLET",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MINT_PRICE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "checkPuzzleCompletion",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "originalTokenId",
        "type": "uint256"
      }
    ],
    "name": "checkPuzzleExists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "solution",
        "type": "string"
      }
    ],
    "name": "completePuzzle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getPuzzleDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "gridSize",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "resolverHash",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "isLocked",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "completionReward",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "contentHash",
            "type": "string"
          }
        ],
        "internalType": "struct PuzzleNFT.PuzzleData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "salePrice",
        "type": "uint256"
      }
    ],
    "name": "getRoyaltyInfo",
    "outputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "royaltyAmount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasCompleted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "hashToTokenId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "mintCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "gridSize",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "resolverHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contentHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "completionReward",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "originalTokenId",
        "type": "uint256"
      }
    ],
    "name": "mintPuzzle",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mintingEnabled",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "puzzleData",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "gridSize",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "resolverHash",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isLocked",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "completionReward",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "contentHash",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "puzzleExists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "royaltyPercentage",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "royaltyReceiver",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_maxSupply",
        "type": "uint256"
      }
    ],
    "name": "setMaxSupply",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_percentage",
        "type": "uint256"
      }
    ],
    "name": "setRoyaltyPercentage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_receiver",
        "type": "address"
      }
    ],
    "name": "setRoyaltyReceiver",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "whitelisted",
        "type": "bool"
      }
    ],
    "name": "setWhitelist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "toggleMinting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "togglePuzzleLock",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "tokenByIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "whitelist",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

const storeHashMapping = async (resolverHash, tokenId) => {
  if (isDev) {
    console.log(`DEV MODE: Storing hash mapping: ${resolverHash} -> ${tokenId}`);
    return;
  }
  
  console.log(`Storing hash mapping: ${resolverHash} -> ${tokenId}`);
};

export const useMintPuzzleNFT = (metadataUrl, gridSize) => {
  const { address } = useAccount();
  const { chain } = useChainId();
  
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

export const mintPuzzleNFT = async (metadataUrl, gridSize, chainId, userAddress, originalTokenId) => {
  try {
    // Helper function to detect wallet provider
    const detectProvider = () => {
      if (window.ethereum) return window.ethereum;
      if (window.coinbaseWallet) return window.coinbaseWallet;
      if (window.walletConnect) return window.walletConnect;
      if (window.trustWallet) return window.trustWallet;
      if (window.web3 && window.web3.currentProvider) return window.web3.currentProvider;
      return null;
    };

    // Detect wallet provider
    const walletProvider = detectProvider();
    if (!walletProvider) {
      throw new Error("Ethereum provider not found. Please install a wallet like MetaMask.");
    }

    // Validate input parameters
    if (!metadataUrl || !gridSize || !chainId || originalTokenId === undefined) {
      throw new Error("Missing required parameters for minting");
    }

    console.log("📌 Input validation:", {
      metadataUrl,
      gridSize: Number(gridSize),
      chainId,
      userAddress,
      originalTokenId,
    });

    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      throw new Error(`No contract address configured for chain ID ${chainId}. Please switch to Base Sepolia.`);
    }

    let provider, signer;

    // Initialize provider and signer based on ethers version
    try {
      // Try ethers v6 approach first
      provider = new ethers.BrowserProvider(walletProvider);
      signer = await provider.getSigner();
    } catch (error) {
      console.log("Failed with ethers v6 approach, trying v5:", error);
      try {
        // Fallback to ethers v5 approach
        provider = new ethers.providers.Web3Provider(walletProvider);
        signer = provider.getSigner();
      } catch (innerError) {
        console.error("Failed with both ethers approaches:", innerError);
        
        // Last resort for direct provider
        if (walletProvider.request) {
          // Create a minimal provider/signer implementation
          provider = {
            getBalance: async (address) => {
              const balanceHex = await walletProvider.request({
                method: 'eth_getBalance',
                params: [address, 'latest']
              });
              return BigInt(balanceHex);
            }
          };
          
          signer = {
            getAddress: async () => {
              const accounts = await walletProvider.request({
                method: 'eth_accounts'
              });
              return accounts[0];
            }
          };
        } else {
          throw new Error("Could not initialize wallet provider. Please check your wallet connection.");
        }
      }
    }

    // Check if the user is connected with the expected address
    const connectedAddress = await signer.getAddress();
    if (userAddress && connectedAddress.toLowerCase() !== userAddress.toLowerCase()) {
      console.warn(`Warning: Connected address ${connectedAddress} doesn't match expected address ${userAddress}`);
    }

    // Ensure user has enough funds for minting
    let balance, mintPrice;
    try {
      balance = await provider.getBalance(connectedAddress);
      // Try both v6 and v5 parseEther depending on which is available
      mintPrice = ethers.parseEther ? ethers.parseEther(MINT_PRICE.toString()) : ethers.utils.parseEther(MINT_PRICE.toString());
    } catch (error) {
      console.error("Error checking balance:", error);
      throw new Error(`Could not check your balance. Please ensure you have at least ${MINT_PRICE} ETH.`);
    }

    // Check if balance is less than mint price using compatible comparison
    const hasInsufficientFunds = typeof balance.lt === 'function' ? balance.lt(mintPrice) : balance < mintPrice;
    if (hasInsufficientFunds) {
      throw new Error(`Insufficient funds. Need ${MINT_PRICE} ETH to mint`);
    }

    // Create contract instance with appropriate method
    let contract;
    try {
      contract = new ethers.Contract(contractAddress, PUZZLE_NFT_ABI, signer);
    } catch (error) {
      console.error("Contract initialization error:", error);
      throw new Error("Failed to initialize contract. Please refresh and try again.");
    }

    console.log("📌 Sending mint transaction with:", {
      metadataUrl,
      gridSize: Number(gridSize),
      resolverHash: metadataUrl,
      contentHash: metadataUrl,
      mintPrice: mintPrice.toString(),
      originalTokenId
    });

    // Send minting transaction
    const tx = await contract.mintPuzzle(
      metadataUrl,
      Number(gridSize),
      metadataUrl, // Using metadata URL as resolverHash
      metadataUrl, // Using metadata URL as contentHash
      mintPrice,   // Completion reward
      originalTokenId,
      { value: mintPrice }
    );

    console.log("✅ Transaction sent:", tx.hash);

    // Wait for transaction to be mined (wait for 1 confirmation)
    const receipt = await tx.wait(1);
    console.log("📌 Transaction receipt:", receipt);

    // Try to extract the token ID from events
    let tokenId = null;
    
    try {
      // First attempt: Try to parse the PuzzleCreated event
      const puzzleCreatedEvents = receipt.logs
        .filter(log => log.address.toLowerCase() === contractAddress.toLowerCase())
        .map(log => {
          try {
            return contract.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
          } catch (e) {
            console.log("Error parsing log:", e);
            return null;
          }
        })
        .filter(parsed => parsed && parsed.name === "PuzzleCreated");

      if (puzzleCreatedEvents.length > 0) {
        tokenId = puzzleCreatedEvents[0].args.tokenId.toString();
        console.log("📌 Found tokenId from event:", tokenId);
      } else {
        // Second attempt: Query the contract's total supply
        const totalSupply = await contract.totalSupply();
        
        // Handle either BigInt or ethers.BigNumber
        const bigIntValue = typeof totalSupply === 'bigint' ? totalSupply : 
                           (totalSupply.toBigInt ? totalSupply.toBigInt() : BigInt(totalSupply.toString()));
        
        tokenId = (bigIntValue - 1n).toString();
        console.log("📌 Derived tokenId from totalSupply:", tokenId);
      }
    } catch (error) {
      console.error("📌 Error getting token ID:", error);
      // Fall back to using transaction hash as identifier
      tokenId = `tx-${tx.hash.slice(0, 10)}`;
    }

    return {
      success: true,
      hash: tx.hash,
      tokenId: tokenId,
      receipt: receipt
    };

  } catch (error) {
    console.error("🚨 Mint error details:", {
      message: error.message,
      code: error.code,
      transaction: error.transaction,
      data: error.data,
      method: error.method,
    });

    // Provide user-friendly error messages
    let errorMessage = "Transaction failed";

    if (error.message?.includes("insufficient funds")) {
      errorMessage = `Insufficient funds. Need ${MINT_PRICE} ETH for minting`;
    } else if (error.message?.includes("user rejected")) {
      errorMessage = "Transaction was rejected by user";
    } else if (error.message?.includes("missing revert data")) {
      errorMessage = "Contract call failed - please check parameters and try again";
    } else if (error.message?.includes("Puzzle already exists")) {
      errorMessage = "This NFT has already been turned into a puzzle";
    } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
      errorMessage = "Cannot estimate gas - the transaction may fail. Check if you're already approved";
    } else if (error.code === "ACTION_REJECTED") {
      errorMessage = "Transaction was rejected in your wallet";
    } else if (error.code === "UNSUPPORTED_OPERATION") {
      errorMessage = "Function not found in contract ABI or event parsing issue. Check contract deployment";
    } else if (error.code === "NETWORK_ERROR") {
      errorMessage = "Network error. Please check your connection and try again";
    }

    return {
      success: false,
      error: errorMessage,
      hash: error.transaction?.hash,
      rawError: error.message
    };
  }
};
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