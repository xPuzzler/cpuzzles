import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { of } from 'ipfs-only-hash';

// 4everland credentials
const ACCESS_KEY = process.env.NEXT_PUBLIC_4EVERLAND_ACCESS_KEY;
const SECRET_KEY = process.env.NEXT_PUBLIC_4EVERLAND_SECRET_KEY;
const BUCKET_NAME = process.env.NEXT_PUBLIC_4EVERLAND_BUCKET_NAME;

// Initialize S3 client
const s3Client = new S3Client({
  region: 'us-west-1',
  endpoint: "https://endpoint.4everland.co",
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

// Upload image to 4everland
export const upload4everlandImageToIPFS = async (imageFile, tokenId) => {
  try {
    if (!tokenId && tokenId !== 0) {
      throw new Error('Token ID is required');
    }

    // Include tokenId in filename
    const fileName = `puzzle-image-${tokenId.toString()}.png`;
    const buffer = await imageFile.arrayBuffer();

    // Upload to 4everland
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: imageFile.type,
      Metadata: {
        'token-id': tokenId.toString(),
        'original-filename': fileName
      }
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Return the store URL
    const imageUrl = `https://${BUCKET_NAME}.4everland.store/${fileName}`;
    console.log('Image uploaded to:', imageUrl);

    return {
      imageUrl,
      tokenId
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error(`4everland upload error: ${error.message}`);
  }
};

// Create metadata
export const create4everlandPuzzleMetadata = (imageUrl, gridSize, arweaveId, tokenId, userTokenId, collectionName, moves) => {
  const puzzleCollectionName = collectionName || 'CPuzzles Collection';
  
  // Make sure we're using store URLs
  const storeUrl = imageUrl.includes('4everland.store') ? 
    imageUrl : 
    `https://${BUCKET_NAME}.4everland.store/puzzle-image-${tokenId}.png`;

  return {
    name: `Puzzle ${puzzleCollectionName} #${userTokenId}`, // This will match the token URI
    description: `Interactive puzzle NFT from ${puzzleCollectionName}. A ${gridSize}x${gridSize} grid puzzle with multiple visual effects and interactive gameplay features.`,
    image: storeUrl,
    animation_url: `https://arweave.net/${arweaveId}`,
    external_url: `https://testnets.opensea.io/assets/base_sepolia/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${tokenId}`,
    puzzleGrid: Array(gridSize).fill().map(() => 
      Array(gridSize).fill().map(() => ({
        type: "piece",
        effect: "normal"
      }))
    ),
    effectsGrid: [
      "normal",
      "invert",
      "sepia",
      "neon",
      "blur"
    ],
    attributes: [
      {
        trait_type: "Collection",
        value: puzzleCollectionName
      },
      {
        trait_type: "Token ID",
        value: userTokenId.toString(),
      },
      {
        trait_type: "Grid Size",
        value: `${gridSize}x${gridSize}`
      },
      {
        trait_type: "Total Pieces",
        value: gridSize * gridSize
      },
      {
        trait_type: "Visual Effects",
        value: "20"
      },
      {
        trait_type: "Game Style",
        value: "Interactive Puzzle"
      },
      {
        trait_type: "Completion Status",
        value: moves > 0 ? "Solved" : "Unsolved"
      }
    ],
    properties: {
      interactive: true,
      puzzle_type: "sliding-tiles",
      creation_date: new Date().toISOString(),
      content_type: "interactive_puzzle",
      collection_name: puzzleCollectionName,
      minimum_moves: gridSize * gridSize * 2,
      original_image: storeUrl,
      animation_source: `https://arweave.net/${arweaveId}`,
      contract_token_id: tokenId.toString(),
      user_token_id: userTokenId.toString(),
      store_url: storeUrl,
      available_effects: [
        {
          name: "Normal",
          type: "base"
        },
        {
          name: "Invert",
          type: "filter"
        },
        {
          name: "Sepia",
          type: "filter"
        },
        {
          name: "Neon",
          type: "special"
        },
        {
          name: "Blur",
          type: "filter"
        }
      ],
      features: [
        "move_counter",
        "timer",
        "visual_effects",
        "shuffle",
        "reset",
        "victory_animation"
      ]
    }
  };
};

// Upload metadata
export const upload4everlandMetadataToIPFS = async (metadata, tokenId) => {
  try {
    // Include tokenId in filename
    const fileName = `metadata-${tokenId}.json`;
    const metadataContent = JSON.stringify(metadata, null, 2);
    const buffer = Buffer.from(metadataContent);

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: 'application/json',
      Metadata: {
        'token-id': tokenId.toString()
      }
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Return store URL instead of IPFS
    const metadataUrl = `https://${BUCKET_NAME}.4everland.store/${fileName}`;
    console.log('Metadata uploaded to:', metadataUrl);

    return metadataUrl;
  } catch (error) {
    console.error('Metadata upload failed:', error);
    throw new Error(`Metadata upload error: ${error.message}`);
  }
};