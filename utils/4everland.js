import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { of } from 'ipfs-only-hash';
import { fetchOpenSeaCollectionData, parseOpenSeaLink } from '../utils/opensea';
import Arweave from 'arweave';

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

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

export const fetchAndUploadImage = async (ipfsUrl, tokenId) => {
  try {
    if (!ipfsUrl || !tokenId) {
      throw new Error("Invalid IPFS URL or Token ID.");
    }

    console.log("🔹 Fetching image from IPFS:", ipfsUrl);

    // **🔹 Fetch Image from IPFS**
    const response = await fetch(ipfsUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from IPFS: ${response.statusText}`);
    }
    const imageBlob = await response.blob();
    const imageFile = new File([imageBlob], `puzzle-${tokenId}.png`, { type: "image/png" });

    console.log("✅ Image successfully downloaded from IPFS!");

    // **🔹 Upload Image to 4everland**
    return await upload4everlandImageToIPFS(imageFile, tokenId);
  } catch (error) {
    console.error("🚨 Error in fetchAndUploadImage:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

export const upload4everlandImageToIPFS = async (imageFile, tokenId, isAnimated) => {
  try {
    const fileExt = isAnimated ? 'gif' : 'png';
    const fileName = `puzzle-${tokenId}-${Date.now()}.${fileExt}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: await imageFile.arrayBuffer(),
      ContentType: isAnimated ? 'image/gif' : 'image/png',
      Metadata: {
        'animation': isAnimated ? 'true' : 'false',
        'token-id': tokenId.toString()
      }
    };

    await s3Client.send(new PutObjectCommand(params));
    return {
      imageUrl: `https://${BUCKET_NAME}.4everland.store/${fileName}`,
      isAnimated
    };
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error;
  }
};

export const uploadPuzzleHTML = async (ipfsImageUrl, gridSize, collectionName) => {
  try {
    if (!ipfsImageUrl) {
      throw new Error("Invalid IPFS image URL.");
    }

    console.log("🔹 Using IPFS image for Arweave HTML:", ipfsImageUrl);

    const puzzleHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Puzzle Preview</title>
        <style>
          body { display: flex; justify-content: center; align-items: center; height: 100vh; background: #111; }
          img { max-width: 90%; height: auto; border-radius: 10px; }
        </style>
      </head>
      <body>
        <img src="${ipfsImageUrl}" alt="Puzzle NFT">
      </body>
      </html>
    `;

    console.log("✅ HTML created, uploading to Arweave...");

    // **🔹 Upload HTML to Arweave**
    const arweaveId = await uploadToArweave(puzzleHTML);
    console.log("✅ HTML uploaded to Arweave:", arweaveId);

    return arweaveId;
  } catch (error) {
    console.error("🚨 Arweave upload failed:", error);
    throw new Error(`Arweave upload error: ${error.message}`);
  }
};

// Create metadata
export const create4everlandPuzzleMetadata = (
  ipfsImageUrl, // ✅ Use IPFS link directly
  gridSize,
  arweaveId,
  tokenId,
  userTokenId,
  collectionName,
  moves,
  contractAddress
) => {
  const puzzleCollectionName = collectionName || "CPuzzles Collection";

  return {
    name: `Puzzle ${puzzleCollectionName} #${userTokenId}`, // ✅ Uses original NFT's collection & token ID
    description: `Interactive puzzle NFT from ${puzzleCollectionName}. A ${gridSize}x${gridSize} grid puzzle with multiple visual effects and interactive gameplay features. \n\nOriginal Link: https://opensea.io/assets/base/${contractAddress}/${userTokenId}`,
    image: ipfsImageUrl,
    animation_url: `https://arweave.net/${arweaveId}`,
    external_url: `https://opensea.io/assets/base/${contractAddress}/${userTokenId}`, // ✅ Uses the correct contract address & token ID
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
      original_image: ipfsImageUrl,
      animation_source: `https://arweave.net/${arweaveId}`,
      contract_token_id: tokenId.toString(),
      user_token_id: userTokenId.toString(),
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
    // ✅ Validate metadata and tokenId
    if (!metadata || typeof metadata !== "object" || Object.keys(metadata).length === 0) {
      throw new Error("Invalid or empty metadata.");
    }
    if (!tokenId || isNaN(tokenId)) {
      throw new Error("Invalid token ID.");
    }

    const fileName = `metadata-${tokenId}.json`;
    const metadataContent = JSON.stringify(metadata, null, 2);
    const buffer = Buffer.from(metadataContent);

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: "application/json",
      Metadata: {
        "token-id": tokenId.toString(),
      },
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // ✅ Construct the Correct Metadata URL
    const metadataUrl = `https://${BUCKET_NAME}.4everland.store/${fileName}`;

    console.log("✅ Metadata uploaded successfully:", metadataUrl);
    return metadataUrl;
  } catch (error) {
    console.error("🚨 Metadata upload failed:", error.message);
    throw new Error(`Metadata upload error: ${error.message}`);
  }
};