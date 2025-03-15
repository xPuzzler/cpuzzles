const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY;
const OPENSEA_BASE_URL = 'https://api.opensea.io/api/v2';

// Enhanced chain mapping with all supported networks
const CHAIN_MAP = {
  1: 'ethereum',      // Ethereum Mainnet
  8453: 'base',       // Base Mainnet
  84531: 'base_sepolia', // Base Sepolia
  42161: 'arbitrum',  // Arbitrum One
  421614: 'arbitrum_sepolia', // Arbitrum Sepolia
  204: 'ape_chain',    // ApeCoin Chain
  2525: 'apechain_testnet', // ApeCoin Chain Testnet
  175177: 'abstract'  // Abstract Chain
};

// Reverse mapping from chain name to chain ID
const CHAIN_ID_MAP = {
  'ethereum': 1,
  'base': 8453,
  'base_sepolia': 84531,
  'arbitrum': 42161,
  'arbitrum_sepolia': 421614,
  'ape_chain': 204, // Handle the API inconsistency
  'apechain_testnet': 2525,
  'abstract': 175177
};

export const fetchOpenSeaCollectionData = async (contractAddress, tokenId, chainId) => {
  try {
    // Get the chain name from the chainId
    const chain = CHAIN_MAP[chainId] || 'ethereum';
    const url = `${OPENSEA_BASE_URL}/chain/${chain}/contract/${contractAddress}/nfts/${tokenId}`;
    
    console.log('Fetching from OpenSea:', url);
    console.log('Chain ID:', chainId, 'Chain name:', chain);

    const response = await fetch(url, {
      headers: {
        'X-API-KEY': OPENSEA_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`OpenSea API error: ${response.status} - ${await response.text()}`);
      throw new Error(`OpenSea API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`OpenSea ${chain} network response:`, data);
    
    // First, check for the collection field directly in the response or in the nft object
    // This is the pattern we're seeing in the console logs
    let collectionName = null;
    
    // Check for direct collection field in root response
    if (data.collection && typeof data.collection === 'string') {
      collectionName = data.collection;
    }
    // Check for collection field in nft object
    else if (data.nft && data.nft.collection && typeof data.nft.collection === 'string') {
      collectionName = data.nft.collection;
    }
    // If still not found, try other possible paths
    else {
      collectionName = 
        // Standard paths
        (data.collection && data.collection.name) ||
        (data.nft?.collection?.name) ||
        // Other possible paths
        data.nft?.asset_contract?.collection?.name ||
        data.nft?.contract?.name;
    }
    
    // If collection name is still not found, use contract as fallback
    if (!collectionName) {
      collectionName = `Collection for ${contractAddress.slice(0, 6)}`;
    }
    
    console.log(`Final ${chain} collection name:`, collectionName);

    return {
      collection: collectionName,
      name: data.nft?.name || `NFT #${tokenId}`,
      description: data.nft?.description || '',
      imageUrl: data.nft?.image_url,
      animationUrl: data.nft?.animation_url,
      isAnimated: Boolean(data.nft?.animation_url),
      chain: chain,
      contractAddress: contractAddress,
      tokenId: tokenId,
      traits: data.nft?.traits || []
    };
  } catch (error) {
    console.error('Collection data fetch error:', error);
    throw error;
  }
};


export const parseNftLink = (url) => {
  try {
    // Updated regex to handle all network variations including underscore formats
    const openSeaRegex = /opensea\.io\/assets\/(ethereum|base|base_sepolia|arbitrum|arbitrum_sepolia|ape_chain|apechain|apechain_testnet|abstract)\/([a-zA-Z0-9]+)\/(\d+)/;
    
    console.log('Parsing URL:', url); // Debug log
    
    const openSeaMatch = url.match(openSeaRegex);
    
    if (openSeaMatch) {
      let chainName = openSeaMatch[1].toLowerCase();
      
      // Normalize chain names
      const chainNameMap = {
        'ethereum': 'ethereum',
        'eth': 'ethereum',
        'mainnet': 'ethereum',
        'base': 'base',
        'base_mainnet': 'base',
        'base_sepolia': 'base_sepolia',
        'basesepolia': 'base_sepolia',
        'arbitrum': 'arbitrum',
        'arbitrum_one': 'arbitrum',
        'arbitrum_sepolia': 'arbitrum_sepolia',
        'arbitrumsepolia': 'arbitrum_sepolia',
        'ape_chain': 'apechain',
        'apechain': 'apechain',
        'apecoin': 'apechain',
        'apechain_testnet': 'apechain_testnet',
        'apechaintestnet': 'apechain_testnet',
        'abstract': 'abstract',
        'abstract_chain': 'abstract',
        'abstractchain': 'abstract'
      };

      // Use the normalized chain name or keep original
      const normalizedChain = chainNameMap[chainName] || chainName;
      
      console.log('Original chain name:', chainName);
      console.log('Normalized chain name:', normalizedChain);

      // Chain ID mapping
      const chainIdMap = {
        'ethereum': 1,
        'base': 8453,
        'base_sepolia': 84531,
        'arbitrum': 42161,
        'arbitrum_sepolia': 421614,
        'apechain': 204,
        'apechain_testnet': 2525,
        'abstract': 175177
      };

      const chainId = chainIdMap[normalizedChain];
      
      if (!chainId) {
        throw new Error(`Unsupported chain: ${chainName}`);
      }

      console.log('Parsed data:', {
        chain: normalizedChain,
        chainId: chainId,
        contractAddress: openSeaMatch[2],
        tokenId: openSeaMatch[3]
      });

      return {
        platform: 'opensea',
        chain: normalizedChain,
        chainId: chainId,
        contractAddress: openSeaMatch[2],
        tokenId: openSeaMatch[3]
      };
    }
    
    console.log('No match found for URL pattern');
    return null;
    
  } catch (error) {
    console.error('Error parsing NFT link:', error);
    return null;
  }
};

// Keep the legacy parser for backward compatibility
export const parseOpenSeaLink = (url) => {
  return parseNftLink(url);
};