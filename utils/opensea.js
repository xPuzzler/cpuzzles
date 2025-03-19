import axios from "axios";

// Function to get NFTs with retry and backoff logic
export const getNFTs = async (walletAddress, chain, cursor = null) => {
  try {
    console.log(`Fetching NFTs for wallet ${walletAddress} on ${chain}${cursor ? ' with cursor' : ''}`);

    // Build the URL with cursor if provided
    let url = `https://api.opensea.io/api/v2/chain/${chain}/account/${walletAddress}/nfts`;
    if (cursor) {
      url += `?cursor=${cursor}`;
    }

    // Make the API request
    const response = await axios.get(url, {
      headers: { "x-api-key": process.env.NEXT_PUBLIC_OPENSEA_API_KEY },
    });

    const nfts = response.data.nfts || [];
    const nextCursor = response.data.next;

    if (!nfts.length) {
      console.warn(`No NFTs found for ${walletAddress} on ${chain} for this page`);
      return { nfts: [], nextCursor };
    }

    // Format the NFTs with unique identifiers to prevent duplication
    const formattedNFTs = nfts.map(nft => ({
      id: `${chain}-${nft.contract}-${nft.identifier}`, // Unique ID to prevent duplicates
      collectionName: nft.collection || "Unknown Collection",
      tokenId: nft.identifier,
      name: nft.name || `NFT #${nft.identifier}`,
      image: nft.image_url || nft.metadata_url || "/placeholder.jpg",
      description: nft.description || "No description available",
      tokenURI: nft.metadata_url || "",
      contractAddress: nft.contract,
      openSeaUrl: nft.opensea_url || "#",
      chain: chain // Add chain information
    }));

    return { nfts: formattedNFTs, nextCursor };
  } catch (error) {
    // Handle rate limiting with exponential backoff
    if (error.response && error.response.status === 429) {
      console.warn(`Rate limited on ${chain}, will retry with backoff`);
      throw new Error(`Rate limited on ${chain}`);
    }
    
    console.error(`Error fetching NFTs from ${chain}:`, error.response?.data || error.message);
    return { nfts: [], nextCursor: null };
  }
};