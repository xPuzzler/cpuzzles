import { useEffect, useState } from "react";
import axios from "axios";

const NFTMirror = ({ walletAddress, setNFTs, setIsLoading }) => {
  const [processedChains, setProcessedChains] = useState(0);
  const [allNFTs, setAllNFTs] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState({});
  const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  
  // Chain configurations with corresponding Alchemy URLs
  const chainConfigs = [
    { 
      id: "ethereum", 
      displayName: "Ethereum", 
      alchemyUrl: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}/getNFTs/`
    },
    { 
      id: "matic", 
      displayName: "Polygon", 
      alchemyUrl: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}/getNFTs/`
    },
    { 
      id: "base", 
      displayName: "Base", 
      alchemyUrl: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}/getNFTs/`
    }
  ];

  // Default placeholder image as base64
  const defaultPlaceholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

  // Make placeholder available to other components
  if (typeof window !== 'undefined') {
    window.NFT_PLACEHOLDER_IMAGE = defaultPlaceholder;
  }

  // Helper function to format token ID
  const formatTokenId = (tokenId) => {
    if (typeof tokenId === 'string' && tokenId.startsWith('0x')) {
      return parseInt(tokenId, 16).toString();
    }
    return tokenId.toString();
  };

  const isLikelyAirdrop = (nft) => {
    const spamIndicators = [
      // Names often contain these terms
      nft.name?.toLowerCase().includes("airdrop"),
      nft.name?.toLowerCase().includes("free"),
      nft.name?.toLowerCase().includes("USDT"),
      nft.name?.toLowerCase().includes("Bully Apes"),
      nft.name?.toLowerCase().includes("$1000"),
      nft.name?.toLowerCase().includes("flyer"),
      nft.name?.toLowerCase().includes("$! $10000"),
      nft.name?.toLowerCase().includes("claim"),
      nft.name?.toLowerCase().includes("$100,000"),
      nft.name?.toLowerCase().includes("1 ETH"),
      nft.name?.toLowerCase().includes("2 ETH"),
      nft.name?.toLowerCase().includes("3 ETH"),
      nft.name?.toLowerCase().includes("4 ETH"),
      nft.name?.toLowerCase().includes("5 ETH"),
      nft.name?.toLowerCase().includes("1ETH"),
      nft.name?.toLowerCase().includes("2ETH"),
      nft.name?.toLowerCase().includes("3ETH"),
      nft.name?.toLowerCase().includes("4ETH"),
      nft.name?.toLowerCase().includes("5ETH"),
      nft.name?.toLowerCase().includes("reward"),
      nft.name?.toLowerCase().includes("prize"),
      nft.name?.toLowerCase().includes("reward"),
nft.name?.toLowerCase().includes("prize"),
nft.name?.toLowerCase().includes("x01"),
nft.name?.toLowerCase().includes(" "),
nft.name?.toLowerCase().includes("$100,000 a bone"),
nft.name?.toLowerCase().includes("$100,000 a babydoge"),
nft.name?.toLowerCase().includes("$100,000 bone"),
nft.name?.toLowerCase().includes("$100,000 babydoge"),
nft.name?.toLowerCase().includes("5 eth by base"),
nft.name?.toLowerCase().includes("???? bonus at 10eth.us"),
nft.name?.toLowerCase().includes("primeval world"),
nft.name?.toLowerCase().includes("! !$100,000 bone"),
nft.name?.toLowerCase().includes("! !$100,000 bone #02"),
nft.name?.toLowerCase().includes("! !$30,000 shib"),
nft.name?.toLowerCase().includes("! $30,000 bone"),
nft.name?.toLowerCase().includes("! [!] boxdao.io #236"),
nft.name?.toLowerCase().includes("$1000 get rewards"),
nft.name?.toLowerCase().includes("$1000 rewards"),
nft.name?.toLowerCase().includes("$1000 usdc voucher"),
nft.name?.toLowerCase().includes("$1000 usdc voucher????"),
nft.name?.toLowerCase().includes("$1000 of shib"),
nft.name?.toLowerCase().includes("$2000 usdc"),
nft.name?.toLowerCase().includes("$2000 usdc voucher????"),
nft.name?.toLowerCase().includes("$2000 usdt reward"),
nft.name?.toLowerCase().includes("$2500 usdc"),
nft.name?.toLowerCase().includes("$3000 ape"),
nft.name?.toLowerCase().includes("$3000 usdc voucher????"),
nft.name?.toLowerCase().includes("$50 000 for free (vipevent.io)"),
nft.name?.toLowerCase().includes("$5000 busd voucher"),
nft.name?.toLowerCase().includes("$5000 usdc"),
nft.name?.toLowerCase().includes("$5000 usdc event"),
nft.name?.toLowerCase().includes("$5000 usdc voucher"),
nft.name?.toLowerCase().includes("$5000 in brett"),
nft.name?.toLowerCase().includes("$5eth reward????"),
nft.name?.toLowerCase().includes("$eth"),
nft.name?.toLowerCase().includes("$meme voucher"),
nft.name?.toLowerCase().includes("$shib reward: t.me/s/shibpool"),
nft.name?.toLowerCase().includes("'"),
nft.name?.toLowerCase().includes("1"),
nft.name?.toLowerCase().includes("1 eth"),
nft.name?.toLowerCase().includes("1 weth"),
nft.name?.toLowerCase().includes("1 steth"),
nft.name?.toLowerCase().includes("1,000 uni by uniswap"),
nft.name?.toLowerCase().includes("1,000 usdt reward"),
nft.name?.toLowerCase().includes("1.000.000 $pendle"),
nft.name?.toLowerCase().includes("1000 uni"),
nft.name?.toLowerCase().includes("1000 usdc"),
nft.name?.toLowerCase().includes("1000 usdt rewards"),
nft.name?.toLowerCase().includes("1000$meme reward"),
nft.name?.toLowerCase().includes("10bnb at 10bnb.us ????"),
nft.name?.toLowerCase().includes("10eth at web3eth.us ????"),
nft.name?.toLowerCase().includes("10k$ at [web3taiko.us] ????"),
nft.name?.toLowerCase().includes("10k$ at web3spacex.us ????"),
nft.name?.toLowerCase().includes("125m shib"),
nft.name?.toLowerCase().includes("15,000$ shib"),
nft.name?.toLowerCase().includes("1500$ ape"),
nft.name?.toLowerCase().includes("1eth reward at [ web3-eth.lol ] ????"),
nft.name?.toLowerCase().includes("1eth reward at [webeth.art] ????"),
nft.name?.toLowerCase().includes("1eth reward at etherc.xyz ????"),
nft.name?.toLowerCase().includes("1eth reward at web3eth.icu ????"),
nft.name?.toLowerCase().includes("1eth reward at web3eth.lol ????"),
nft.name?.toLowerCase().includes("1eth reward at webeth.icu ????"),
nft.name?.toLowerCase().includes("1t babydoge"),
nft.name?.toLowerCase().includes("2,000 usdt reward"),
nft.name?.toLowerCase().includes("20,000 usdt reward"),
nft.name?.toLowerCase().includes("2000$ reward"),
nft.name?.toLowerCase().includes("2000$ usdc"),
nft.name?.toLowerCase().includes("2000$ usdc coin"),
nft.name?.toLowerCase().includes("200m shib"),
nft.name?.toLowerCase().includes("2500 usdt by etherscan x metawin"),
nft.name?.toLowerCase().includes("3k$ at getusd.us ????"),
nft.name?.toLowerCase().includes("3nity"),
nft.name?.toLowerCase().includes("5 eth by base"),
nft.name?.toLowerCase().includes("5 steth event"),
nft.name?.toLowerCase().includes("5,000 busd"),
nft.name?.toLowerCase().includes("5,000 usdc voucher"),
nft.name?.toLowerCase().includes("5,000 usdt voucher"),
nft.name?.toLowerCase().includes("5.00 eth by base"),
nft.name?.toLowerCase().includes("5000 $busd"),
nft.name?.toLowerCase().includes("5000 busd"),
nft.name?.toLowerCase().includes("5000 busd voucher"),
nft.name?.toLowerCase().includes("5000 usdc"),
nft.name?.toLowerCase().includes("5000 usdc voucher"),
nft.name?.toLowerCase().includes("5000$ cyber"),
nft.name?.toLowerCase().includes("5000$ reward at adrpgbt.lol ????"),
nft.name?.toLowerCase().includes("50m $shib voucher"),
nft.name?.toLowerCase().includes("5o ooo usd for free"),
nft.name?.toLowerCase().includes("700 ldo"),
nft.name?.toLowerCase().includes("700m shib"),
nft.name?.toLowerCase().includes("888 alpha rams"),
nft.name?.toLowerCase().includes("???? bonus at 5eth.us"),
nft.name?.toLowerCase().includes("???? reward at 2000usdc.net"),
nft.name?.toLowerCase().includes("????10k$ gift at [bit.ly/tpepe]"),
nft.name?.toLowerCase().includes("????5k$ gift at [t.ly/aaves]"),
nft.name?.toLowerCase().includes("aave nft"),
nft.name?.toLowerCase().includes("abatar"),
nft.name?.toLowerCase().includes("ape nft tickets"),
nft.name?.toLowerCase().includes("avalance nft tickets"),
nft.name?.toLowerCase().includes("alpha bulls"),
nft.name?.toLowerCase().includes("Okay Doodles"),
nft.name?.toLowerCase().includes("$3000 USDC Voucher?"),
nft.name?.toLowerCase().includes("1"),
nft.name?.toLowerCase().includes("3K$ at getusd.us ????"),
nft.name?.toLowerCase().includes("[ 5О‧ООО‧USD‧FОR‧FRЕЕ ]"),
nft.name?.toLowerCase().includes("BULLY APES"),
nft.name?.toLowerCase().includes("5O OOO USD FOR FREE"),
nft.name?.toLowerCase().includes("???? Bonus at 5eth.us"),
nft.name?.toLowerCase().includes("AVALANCE NFT TICKETS"),
nft.name?.toLowerCase().includes("Bully Apes Flyer Collection"),
nft.name?.toLowerCase().includes("The Chosens"),
nft.name?.toLowerCase().includes("DoodleBirds WTF"),
nft.name?.toLowerCase().includes("Goblinverz.wtf"),
nft.name?.toLowerCase().includes("Alone Woman"),
nft.name?.toLowerCase().includes("5 ETH Voucher by"),
nft.name?.toLowerCase().includes("Exclusive%/-#987"),
nft.name?.toLowerCase().includes("! [!] boxdao.io #236"),
nft.name?.toLowerCase().includes("arcade playing cards"),
nft.name?.toLowerCase().includes("arcade weapons nft collection"),
nft.name?.toLowerCase().includes("artemis project"),
      nft.collectionName?.toLowerCase().includes("airdrop"),
      
      // Description indicators
      typeof nft.description === 'string' && nft.description.toLowerCase().includes("telegram"),
      typeof nft.description === 'string' && nft.description.toLowerCase().includes("discord.gg"),
      typeof nft.description === 'string' && nft.description.toLowerCase().includes("claim your"),
      typeof nft.description === 'string' && nft.description.toLowerCase().includes("connect wallet"),
      typeof nft.description === 'string' && nft.description.toLowerCase().includes("Tickets"),
      typeof nft.description === 'string' && nft.description.toLowerCase().includes("Voucher"),
      
      // If the NFT has no image, it's often spam
      !nft.image || nft.image === defaultPlaceholder,
      
      // If the token ID is extremely large, it's often spam
      nft.tokenId?.length > 15
    ];
    
    // If more than 2 indicators are true, likely spam
    return spamIndicators.filter(Boolean).length >= 2;
  };

  // Function to fetch NFTs with pagination
  const fetchNFTsWithPagination = async (chain, pageKey = null) => {
    try {
      let url = `${chain.alchemyUrl}?owner=${walletAddress}`;
      if (pageKey) {
        url += `&pageKey=${pageKey}`;
      }
      
      const response = await axios.get(url);
      const nfts = response.data.ownedNfts || [];
      
      // Format NFTs
      const formattedNfts = nfts.map(nft => {
        const formattedTokenId = formatTokenId(nft.id.tokenId);
        const imageUrl = nft.media[0]?.gateway || nft.media[0]?.raw || defaultPlaceholder;
        
        return {
          id: `${chain.id}-${nft.contract.address}-${formattedTokenId}`,
          collectionName: nft.contractMetadata?.name || "Unknown Collection",
          tokenId: formattedTokenId,
          identifier: nft.id.tokenId,
          name: nft.title || `NFT #${formattedTokenId}`,
          image: imageUrl,
          description: nft.description || "No description available",
          tokenURI: nft.tokenUri?.gateway || "",
          contractAddress: nft.contract.address,
          chain: chain.id,
          chainDisplayName: chain.displayName,
          openSeaUrl: `https://opensea.io/assets/${chain.id}/${nft.contract.address}/${formattedTokenId}`,
          // Add metadata for spam detection
          transferCount: nft.transferCount || 0,
          isSpam: nft.spamInfo?.isSpam || false
        };
      });
      
      // Update progress
      setLoadingProgress(prev => ({
        ...prev,
        [chain.id]: {
          ...prev[chain.id],
          loaded: (prev[chain.id]?.loaded || 0) + nfts.length,
          total: response.data.totalCount || 0
        }
      }));
      
      // Return the formatted NFTs and the next page key if any
      return { 
        nfts: formattedNfts,
        nextPageKey: response.data.pageKey
      };
    } catch (error) {
      console.error(`Error fetching ${chain.displayName} NFTs:`, error);
      return { nfts: [], nextPageKey: null };
    }
  };

  // Function to fetch all NFTs for a chain
  const fetchAllNFTsForChain = async (chain) => {
    let allChainNFTs = [];
    let pageKey = null;
    let pageCount = 0;
    const MAX_PAGES = 100; // Safety limit to prevent infinite loops
    
    // Initialize progress tracking for this chain
    setLoadingProgress(prev => ({
      ...prev,
      [chain.id]: { loaded: 0, total: 0 }
    }));
    
    do {
      const { nfts, nextPageKey } = await fetchNFTsWithPagination(chain, pageKey);
      allChainNFTs = [...allChainNFTs, ...nfts];
      pageKey = nextPageKey;
      pageCount++;
      
      // Update the global NFT list incrementally
      setAllNFTs(currentNFTs => {
        const updatedNFTs = [...currentNFTs];
        // Add new NFTs to the list, avoiding duplicates
        nfts.forEach(nft => {
          if (!updatedNFTs.some(existingNFT => existingNFT.id === nft.id)) {
            updatedNFTs.push(nft);
          }
        });
        return updatedNFTs;
      });
      
      // Exit if we've reached the max page count or there are no more pages
    } while (pageKey && pageCount < MAX_PAGES);
    
    console.log(`✅ Completed fetching ${allChainNFTs.length} NFTs from ${chain.displayName}`);
    return allChainNFTs;
  };

  useEffect(() => {
    if (!walletAddress) return;
    
    const mirrorWalletNFTs = async () => {
      setIsLoading(true);
      setNFTs([]);
      setAllNFTs([]);
      setProcessedChains(0);
      setLoadingProgress({});
      
      // Process all chains in parallel
      const chainResults = await Promise.all(
        chainConfigs.map(async (chain) => {
          try {
            console.log(`🔄 Mirroring NFTs from ${chain.displayName}...`);
            const chainNFTs = await fetchAllNFTsForChain(chain);
            return chainNFTs;
          } catch (error) {
            console.error(`Error processing ${chain.displayName}:`, error);
            return [];
          } finally {
            setProcessedChains(prev => prev + 1);
          }
        })
      );
      
      // Combine all NFTs from all chains
      const allFetchedNFTs = chainResults.flat();
      const uniqueNFTMap = new Map();
      
      // Deduplicate NFTs
      allFetchedNFTs.forEach(nft => {
        uniqueNFTMap.set(nft.id, nft);
      });
      
      const uniqueNFTs = Array.from(uniqueNFTMap.values());
      
      // Filter out likely airdrops (can be toggled)
      const filteredNFTs = uniqueNFTs.map(nft => ({
        ...nft,
        isLikelyAirdrop: isLikelyAirdrop(nft)
      }));
      
      setNFTs(filteredNFTs);
      setAllNFTs(filteredNFTs);
      
      console.log(`🎯 Finished mirroring all NFTs: ${filteredNFTs.length} unique NFTs found`);
      setIsLoading(false);
    };
    
    mirrorWalletNFTs();
  }, [walletAddress, setNFTs, setIsLoading]);
  
  // Calculate overall loading progress
  const totalLoaded = Object.values(loadingProgress).reduce((sum, chain) => sum + chain.loaded, 0);
  const totalNFTs = Object.values(loadingProgress).reduce((sum, chain) => sum + chain.total, 0);
  const overallProgress = totalNFTs > 0 ? (totalLoaded / totalNFTs) * 100 : 0;
  
  return (
    <>
      {setIsLoading && processedChains > 0 && processedChains < chainConfigs.length && (
        <div className="fixed bottom-4 right-4 bg-gray-900 p-3 rounded-lg shadow-lg z-20">
          <div className="text-sm text-gray-300 mb-1">
            Loading NFTs: {totalLoaded}/{totalNFTs || "??"}
          </div>
          <div className="text-xs text-gray-400 mb-2">
            {processedChains}/{chainConfigs.length} chains processed
          </div>
          <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{width: `${overallProgress}%`}}
            ></div>
          </div>
        </div>
      )}
    </>
  );
};

export default NFTMirror;