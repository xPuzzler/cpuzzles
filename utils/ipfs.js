import Arweave from 'arweave';

// Initialize Arweave
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 20000,
});

let walletKey;
try {
  walletKey = JSON.parse(process.env.NEXT_PUBLIC_ARWEAVE_WALLET_KEY);
  if (!walletKey) {
    throw new Error('Arweave wallet key not found in environment variables');
  }
} catch (error) {
  console.error('Failed to parse Arweave wallet key:', error);
  throw new Error('Invalid Arweave wallet configuration');
}

/**
 * Uploads content to Arweave
 * @param {string|object} content - The content to upload
 * @param {string} contentType - The content type (e.g., 'text/html', 'application/json')
 * @returns {Promise<string>} - The Arweave URL of the uploaded content
 */
export const uploadToArweave = async (content, contentType = 'text/html') => {
  try {
    // Convert content to buffer if it's a string
    const data = typeof content === 'string' ? 
      Buffer.from(content) : 
      Buffer.from(await content.arrayBuffer());

    // Create transaction
    const transaction = await arweave.createTransaction({
      data: data
    }, walletKey);

    // Add content type tag
    transaction.addTag('Content-Type', contentType);
    transaction.addTag('App-Name', 'CPuzzles');
    transaction.addTag('Content-Type', contentType);

    // Sign the transaction
    await arweave.transactions.sign(transaction, walletKey);
    
    console.log('Uploading to Arweave...');
    const response = await arweave.transactions.post(transaction);

    if (response.status !== 200 && response.status !== 202) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    // Just return the transaction ID
    return transaction.id;

  } catch (error) {
    console.error('Arweave upload error:', error);
    throw new Error(`Failed to upload to Arweave: ${error.message}`);
  }
};

/**
 * Creates metadata for a puzzle NFT
 * @param {string} imageUrl - The IPFS URI of the puzzle image
 * @param {number} gridSize - The size of the puzzle grid (e.g., 3 for 3x3)
 * @param {string} creatorAddress - The Ethereum address of the creator
 * @param {string} arweaveUrl - The Arweave URL of the interactive content
 * @returns {Object} - The metadata object
 */
export const createPuzzleMetadata = (imageUrl, gridSize, arweaveId) => ({
  name: `Puzzle #${Math.floor(Math.random() * 10000)}`,
  description: "Welcome to CPuzzles, an interactive puzzle collection where each piece becomes a unique challenge. Players can explore different modes, effects, and solve increasingly complex puzzles.\n\n===== CONTROLS =====\n\nMOVES\n[ click ] - select piece\n[ click ] - swap pieces\n\nEFFECTS\n[ e ] - cycle effects\n[ r ] - reset puzzle\n[ s ] - shuffle pieces\n\nMODES\n[ 1 ] - normal\n[ 2 ] - invert\n[ 3 ] - sepia\n[ 4 ] - neon\n\nSOLVE\n- Match pieces to complete the image\n- Track your moves\n- Beat your best time",
  image: imageUrl,
  animation_url: `https://arweave.net/${arweaveId}`,
  puzzle_config: {
    gridSize: gridSize,
    totalPieces: gridSize * gridSize,
    effects: [
      "normal",
      "invert",
      "sepia",
      "blue-shift",
      "neon"
    ]
  },
  game_settings: {
    min_moves: gridSize * gridSize * 2,
    difficulty: gridSize <= 3 ? "easy" : gridSize <= 4 ? "medium" : "hard",
    has_timer: true,
    has_move_counter: true,
    has_effects: true
  },
  attributes: [
    {
      trait_type: "Puzzle Size",
      value: `${gridSize}x${gridSize}`
    },
    {
      trait_type: "Difficulty",
      value: gridSize <= 3 ? "Easy" : gridSize <= 4 ? "Medium" : "Hard"
    },
    {
      trait_type: "Total Pieces",
      value: gridSize * gridSize
    },
    {
      trait_type: "Game Type",
      value: "Sliding Puzzle"
    },
    {
      trait_type: "Visual Effects",
      value: "5 Modes"
    },
    {
      trait_type: "Features",
      value: "Interactive"
    }
  ],
  properties: {
    interactive: true,
    puzzle_type: "sliding-tiles",
    creation_date: new Date().toISOString(),
    content_type: "interactive_puzzle",
    minimum_moves: gridSize * gridSize * 2,
    features: [
      "move_counter",
      "timer",
      "visual_effects",
      "shuffle",
      "reset",
      "victory_animation"
    ]
  }
});