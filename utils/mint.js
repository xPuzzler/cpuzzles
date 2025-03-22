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
    // Simplified provider detection focusing on mobile compatibility
    let provider;
    if (window.ethereum) {
      provider = window.ethereum;
    } else if (window.walletConnect) {
      provider = window.walletConnect;
    } else if (window.web3 && window.web3.currentProvider) {
      provider = window.web3.currentProvider;
    } else {
      throw new Error("No wallet provider detected. Please open in MetaMask browser or connect your wallet.");
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

    // Ensure connection before proceeding
    let accounts;
    try {
      accounts = await provider.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        accounts = await provider.request({ method: 'eth_requestAccounts' });
      }
    } catch (error) {
      console.error("Connection error:", error);
      throw new Error("Failed to connect to your wallet. Please try reconnecting manually.");
    }

    const connectedAddress = accounts[0];
    if (!connectedAddress) {
      throw new Error("Could not get connected address. Please make sure your wallet is unlocked.");
    }

    if (userAddress && connectedAddress.toLowerCase() !== userAddress.toLowerCase()) {
      console.warn(`Warning: Connected address ${connectedAddress} doesn't match expected address ${userAddress}`);
    }

    // Check chain ID
    const currentChainId = await provider.request({ method: 'eth_chainId' });
    if (currentChainId !== `0x${chainId.toString(16)}`) {
      try {
        // Try to switch chain
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }]
        });
      } catch (error) {
        throw new Error(`Please switch to the correct network in your wallet (Chain ID: ${chainId}).`);
      }
    }

    // Get balance using provider directly
    const balanceHex = await provider.request({
      method: 'eth_getBalance',
      params: [connectedAddress, 'latest']
    });
    
    const balance = BigInt(balanceHex);
    const mintPrice = BigInt(ethers.utils.parseEther(MINT_PRICE.toString()).toString());
    
    if (balance < mintPrice) {
      throw new Error(`Insufficient funds. Need ${MINT_PRICE} ETH to mint`);
    }

    // Create contract instance with ethers
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const contract = new ethers.Contract(contractAddress, PUZZLE_NFT_ABI, signer);

    console.log("📌 Sending mint transaction with:", {
      metadataUrl,
      gridSize: Number(gridSize),
      resolverHash: metadataUrl,
      contentHash: metadataUrl,
      mintPrice: mintPrice.toString(),
      originalTokenId
    });

    // Send transaction with specific gas parameters for mobile
    const gasEstimate = await contract.estimateGas.mintPuzzle(
      metadataUrl,
      Number(gridSize),
      metadataUrl, // resolverHash
      metadataUrl, // contentHash
      mintPrice,   // Completion reward
      originalTokenId,
      { value: mintPrice }
    );

    // Add 20% buffer to gas estimate for mobile wallets
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

    // Send minting transaction with specific gas limit
    const tx = await contract.mintPuzzle(
      metadataUrl,
      Number(gridSize),
      metadataUrl, // resolverHash
      metadataUrl, // contentHash
      mintPrice,   // Completion reward
      originalTokenId,
      { 
        value: mintPrice,
        gasLimit
      }
    );

    console.log("✅ Transaction sent:", tx.hash);

    // Add a timeout for mobile wallets that might hang
    const receiptPromise = tx.wait(1);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Transaction confirmation timed out, but it may still complete. Check your wallet for status.")), 60000)
    );

    // Race between normal confirmation and timeout
    const receipt = await Promise.race([receiptPromise, timeoutPromise]);
    console.log("📌 Transaction receipt:", receipt);

    // Extract token ID
    let tokenId = null;
    try {
      const puzzleCreatedEvents = receipt.logs
        .filter(log => log.address.toLowerCase() === contractAddress.toLowerCase())
        .map(log => {
          try {
            return contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .filter(parsed => parsed && parsed.name === "PuzzleCreated");

      if (puzzleCreatedEvents.length > 0) {
        tokenId = puzzleCreatedEvents[0].args.tokenId.toString();
      } else {
        const totalSupply = await contract.totalSupply();
        tokenId = (totalSupply.sub(ethers.BigNumber.from(1))).toString();
      }
    } catch (error) {
      console.error("📌 Error getting token ID:", error);
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

    // Improved error messages for mobile
    let errorMessage = "Transaction failed";

    if (error.message?.includes("insufficient funds")) {
      errorMessage = `Insufficient funds. Need ${MINT_PRICE} ETH for minting`;
    } else if (error.message?.includes("user rejected") || error.code === "ACTION_REJECTED") {
      errorMessage = "Transaction was rejected in your wallet";
    } else if (error.message?.includes("transaction underpriced")) {
      errorMessage = "Transaction underpriced. Please try again with higher gas settings.";
    } else if (error.message?.includes("nonce")) {
      errorMessage = "Transaction nonce issue. Please reset your wallet or try again.";
    } else if (error.message?.includes("timeout")) {
      errorMessage = "Transaction took too long. Check your wallet app for status.";
    } else if (error.message?.includes("eth_accounts") || error.message?.includes("eth_requestAccounts")) {
      errorMessage = "Wallet connection failed. Please restart your wallet app and try again.";
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