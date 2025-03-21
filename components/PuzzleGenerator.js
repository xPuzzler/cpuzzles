import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { Upload, Shuffle, RotateCw, Trophy, Share2, Puzzle, Sun, Moon, Shield, AlertCircle, ExternalLink, Search, FileText, Gift, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { 
  upload4everlandImageToIPFS as uploadImageToIPFS,
  create4everlandPuzzleMetadata as createPuzzleMetadata, 
  upload4everlandMetadataToIPFS as uploadMetadataToIPFS,
  convert4everlandToIPFS,
} from '../utils/4everland';
import { uploadToArweave } from '../utils/ipfs';
import { mintPuzzleNFT, getRemainingMints, getMintPrice, MAX_PER_WALLET } from '../utils/mint';
import { ethers } from 'ethers';
import contractABI from '../utils/contractABI.json';
import { PUZZLE_NFT_ABI } from '../utils/mint';

const PuzzleGenerator = ({ nft }) => {
  const [gridSize, setGridSize] = useState(3);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const [image, setImage] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [solved, setSolved] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAnimated, setIsAnimated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mintedTokenId, setMintedTokenId] = useState(null);
  const [remainingMints, setRemainingMints] = useState(0);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [success, setSuccess] = useState(false);
  const [touchSupported, setTouchSupported] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [currentEffect, setCurrentEffect] = useState(0);
  const [showEffectOverlay, setShowEffectOverlay] = useState(false);
  const [hasBeenSolved, setHasBeenSolved] = useState(false);
  const chainId = useChainId();
const [mintStatus, setMintStatus] = useState({
  status: null,
  message: '',
  tokenId: null,
  transactionHash: null
});
const [collections, setCollections] = useState([]);
const [selectedCollection, setSelectedCollection] = useState(null);
const [collectionInput, setCollectionInput] = useState('');
  const [collectionURL, setCollectionURL] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [tokenIdInput, setTokenIdInput] = useState('');
  const [mintedTokenIds, setMintedTokenIds] = useState([]); // Track minted token IDs
  const [mintError, setMintError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
const [showSuccessMessage, setShowSuccessMessage] = useState(false);
const [totalMinted, setTotalMinted] = useState(0);
const [lastMintedId, setLastMintedId] = useState(null);
const [totalSupply, setTotalSupply] = useState(0);
const [mintedCount, setMintedCount] = useState(0);
const [maxMints] = useState(MAX_PER_WALLET);
const [nftLink, setNftLink] = useState('');
const [parsedNftData, setParsedNftData] = useState(null);
const [isValidatingLink, setIsValidatingLink] = useState(false);
const canvasRef = useRef(null);
const containerRef = useRef(null);
const [width, setWidth] = useState(0);
const [height, setHeight] = useState(0);
const [selectedNFT, setSelectedNFT] = useState(null);
const contractAddress = '0x4725F266C295E729F29a295b8F0e560EDD9a28b2'; // Replace with your actual deployed contract address
const contractABI = [
  // Replace with the actual ABI of your contract
  "function MINT_PRICE() external view returns (uint256)",
  "function MAX_PER_WALLET() external view returns (uint256)"
];

  const colorEffects = [
    { name: 'Normal', filter: 'none' },
    { name: 'Invert', filter: 'invert(100%)' },
    { name: 'Neon', filter: 'saturate(200%) brightness(150%) contrast(120%)' },
    { name: 'Synthwave', filter: 'hue-rotate(320deg) saturate(250%) brightness(90%) contrast(140%)' },
    { name: 'Hologram', filter: 'hue-rotate(210deg) saturate(180%) brightness(130%) contrast(110%) blur(0.3px)' },
    { name: 'Glitch', filter: 'hue-rotate(90deg) saturate(200%) contrast(150%) brightness(120%)' },
    { name: "Vaporwave", filter: "hue-rotate(310deg) saturate(180%) brightness(110%) contrast(110%)" },
    { name: "Midnight", filter: "brightness(80%) contrast(120%) hue-rotate(210deg) saturate(130%)" },
    { name: "Radioactive", filter: "sepia(20%) hue-rotate(90deg) saturate(300%) brightness(110%) contrast(130%)" },
    { name: "Arctic", filter: "brightness(110%) contrast(110%) hue-rotate(170deg) saturate(70%) blur(0.5px)" },
    { name: "Dystopian", filter: "grayscale(50%) contrast(150%) brightness(80%) sepia(20%)" },
    { name: "Infrared", filter: "hue-rotate(150deg) saturate(200%) contrast(130%) brightness(110%)" },
    { name: "Acid", filter: "hue-rotate(70deg) saturate(300%) contrast(140%) brightness(130%)" },
    { name: "Eternity", filter: "grayscale(30%) hue-rotate(200deg) saturate(130%) brightness(90%) contrast(120%)" },
    { name: "Chrome", filter: "grayscale(100%) brightness(130%) contrast(150%)" },
    { name: "Eclipse", filter: "brightness(70%) contrast(150%) saturate(120%)" },
    { name: 'Thermal', filter: 'saturate(300%) brightness(100%) contrast(150%) hue-rotate(30deg)' },
    { name: 'Frostbite', filter: 'hue-rotate(180deg) saturate(150%) brightness(110%) contrast(130%) blur(0.3px)' },
    { name: 'Ultraviolet', filter: 'brightness(100%) contrast(140%) saturate(200%) hue-rotate(270deg)' },
    { name: 'Nebula', filter: 'hue-rotate(230deg) saturate(250%) brightness(90%) contrast(130%) blur(0.2px)' }
    ];

    const cycleEffects = () => {
      setCurrentEffect((prevEffect) => (prevEffect + 1) % colorEffects.length);
    };

    // At the top of your component
useEffect(() => {
  // Detect mobile browsers
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  console.log('Mobile detected:', isMobile);
  
  // Prevent zooming
  const preventZoom = (e) => {
    if (e.touches.length > 1) e.preventDefault();
  };
  
  document.addEventListener('touchstart', preventZoom, { passive: false });
  return () => document.removeEventListener('touchstart', preventZoom);
}, []);

  useEffect(() => {
    const fetchMints = async () => {
      try {
        if (!address || !chainId) return;
        
        const remaining = await getRemainingMints(address, chainId);
        setRemainingMints(remaining);
      } catch (error) {
        console.error('Mint count error:', error);
      }
    };

    fetchMints();
  }, [address, chainId]); // Include chainId in dependencies

  useEffect(() => {
    if (nft && nft.image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setImage(img);
      };
      img.onerror = (e) => {
        console.error("Error loading NFT image:", e);
        setImage(null); 
        // Set a placeholder or handle the error
      };
      img.src = `/api/proxy?url=${encodeURIComponent(nft.image)}`;
    }
  }, [nft]);
  useEffect(() => {
    const updateWindowDimensions = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    
    updateWindowDimensions();
    window.addEventListener('resize', updateWindowDimensions);
    
    return () => {
      window.removeEventListener('resize', updateWindowDimensions);
    };
  }, []);

  useEffect(() => {
    if (image && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const maxWidth = Math.min(containerWidth, image.width);
      const scaleFactor = maxWidth / image.width;
      const height = image.height * scaleFactor;
      
      setContainerDimensions({
        width: maxWidth,
        height: height
      });
    }
  }, [image, containerRef, window.innerWidth]);

  useEffect(() => {
    if (containerRef.current) {
      const preventDefaultTouch = (e) => {
        if (gameStarted) {
          e.preventDefault();
        }
      };
      
      const container = containerRef.current;
      container.addEventListener('touchstart', preventDefaultTouch, { passive: false });
      
      return () => {
        container.removeEventListener('touchstart', preventDefaultTouch);
      };
    }
  }, [gameStarted, containerRef]);

  const handleSelectNFT = (nft) => {
    console.log("NFT Selected:", nft); // Debug log
    setSelectedNFT(nft); // Make sure this updates state
};

  const handleEffectClick = () => {
    if (solved || hasBeenSolved) {
      setCurrentEffect((prevEffect) => (prevEffect + 1) % colorEffects.length);
      
      // Show the effect overlay with animation
      setShowEffectOverlay(true);
      setTimeout(() => setShowEffectOverlay(false), 300);
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (!file) return;
  
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = URL.createObjectURL(file);
    
    // Check if the file is a GIF
    const isGif = file.type === 'image/gif';
    setIsAnimated(isGif);
    
    img.onload = () => {
      // Check minimum image size
      if (img.width < 200 || img.height < 200) {
        setError('Image is too small. Please use an image that is at least 200x200px.');
        return;
      }
      
      // Check maximum image size
      if (img.width > 2000 || img.height > 2000) {
        setError('Image is too large. Please use an image that is at most 2000x2000px.');
        return;
      }
      
      setError(null);
      setImage(img);
      setSolved(false);
      setGameStarted(false);
      setMoves(0);
      setCurrentEffect(0);
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': ['.jpg', '.jpeg', '.png', '.gif']},
    maxSize: 5 * 1024 * 1024
  });
  

  
  // Add this useEffect to monitor collection name changes
  useEffect(() => {
    if (collectionName) {
      console.log('Collection name state updated to:', collectionName);
    }
  }, [collectionName]);



// Replace the existing sliceImage function
const sliceImage = useCallback(() => {
  if (!image || !canvasRef.current || !containerRef.current) return;

  // Get container dimensions
  const containerWidth = containerRef.current.offsetWidth;
  const containerHeight = containerRef.current.offsetHeight;
  
  // Calculate aspect ratio
  const imageAspectRatio = image.width / image.height;
  
  // Calculate dimensions to fit container
  let displayWidth, displayHeight;
  if (imageAspectRatio > 1) {
    displayWidth = Math.min(containerWidth, image.width);
    displayHeight = displayWidth / imageAspectRatio;
  } else {
    displayHeight = Math.min(containerHeight, image.height);
    displayWidth = displayHeight * imageAspectRatio;
  }
  
  setContainerDimensions({
    width: displayWidth,
    height: displayHeight
  });
  
  // Set up canvas
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  
  // Create new image with crossOrigin
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = image.src;
  
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    const pieceWidth = image.width / gridSize;
    const pieceHeight = image.height / gridSize;
    const displayPieceWidth = displayWidth / gridSize;
    const displayPieceHeight = displayHeight / gridSize;
    const newPieces = [];

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        newPieces.push({
          id: `${x}-${y}`,
          correctX: x,
          correctY: y,
          currentX: x,
          currentY: y,
          isAnimated: false,
          originalSrc: img.src,
          clipInfo: {
            x: x * pieceWidth,
            y: y * pieceHeight,
            width: pieceWidth,
            height: pieceHeight
          },
          xPos: x * displayPieceWidth,
          yPos: y * displayPieceHeight,
          displayWidth: displayPieceWidth,
          displayHeight: displayPieceHeight
        });
      }
    }
    
    setPieces(newPieces);
    setSolved(false);
    setGameStarted(false);
    setCurrentEffect(0);
    setHasBeenSolved(false);
  };
}, [image, gridSize]);

  const shufflePieces = useCallback(() => {
    if (!image || pieces.length === 0) return;
    
    setPieces(prevPieces => {
      const displayPieceWidth = prevPieces[0].displayWidth;
      const displayPieceHeight = prevPieces[0].displayHeight;
      const shuffled = [...prevPieces];
      
      // Fisher-Yates shuffle algorithm
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        
        // Swap current positions
        const tempX = shuffled[i].currentX;
        const tempY = shuffled[i].currentY;
        
        shuffled[i].currentX = shuffled[j].currentX;
        shuffled[i].currentY = shuffled[j].currentY;
        
        shuffled[j].currentX = tempX;
        shuffled[j].currentY = tempY;
      }
      
      // Update positions in the UI
      shuffled.forEach(piece => {
        piece.xPos = piece.currentX * displayPieceWidth;
        piece.yPos = piece.currentY * displayPieceHeight;
      });
      
      return shuffled;
    });
    
    setGameStarted(true);
    setSolved(false);
    setMoves(0);
    setCurrentEffect(0); 
    setHasBeenSolved(false);
  }, [image, pieces, gridSize]);

  const handleMouseDown = (e, id) => {
    if (!gameStarted) return;
    
    e.preventDefault();
    const element = document.getElementById(`piece-${id}`);
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Find the original piece position
    const piece = pieces.find(p => p.id === id);
    
    setDraggingId(id);
    setDragOffset({ x: offsetX, y: offsetY });
    
    // Store the initial position of the drag
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left - offsetX;
    const y = e.clientY - containerRect.top - offsetY;
    setDragPosition({ x, y });
    
    // Apply the absolute positioning immediately
    element.style.position = 'absolute';
    element.style.zIndex = '100';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.classList.add('dragging');
  };
  
  const handleMouseMove = (e) => {
    if (!draggingId) return;
    e.preventDefault();
    
    const element = document.getElementById(`piece-${draggingId}`);
    if (!element) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;
    
    // Calculate position based on mouse and offset
    const x = mouseX - dragOffset.x;
    const y = mouseY - dragOffset.y;
    
    // Update drag position state
    setDragPosition({ x, y });
    
    // Apply absolute positioning to follow mouse
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  };
  
  const handleMouseUp = (e) => {
    if (!draggingId) return;
    e.preventDefault();
    
    const draggedPiece = pieces.find(p => p.id === draggingId);
    if (!draggedPiece) return;
    
    const element = document.getElementById(`piece-${draggingId}`);
    if (!element) return;
    
    // Get the current mouse position
    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;
    
    // Find which grid cell it's over
    const pieceWidth = containerDimensions.width / gridSize;
    const pieceHeight = containerDimensions.height / gridSize;
    
    const gridX = Math.floor(mouseX / pieceWidth);
    const gridY = Math.floor(mouseY / pieceHeight);
    
    // Only swap if we're within grid boundaries
    if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
      // Find which piece is currently in this spot
      const targetPiece = pieces.find(p => p.currentX === gridX && p.currentY === gridY);
      
      if (targetPiece && targetPiece.id !== draggingId) {
        // Only swap these two pieces
        setPieces(prevPieces => {
          return prevPieces.map(piece => {
            if (piece.id === draggingId) {
              // This is the dragged piece - move it to target position
              return {
                ...piece,
                currentX: gridX,
                currentY: gridY,
                xPos: gridX * pieceWidth,
                yPos: gridY * pieceHeight
              };
            } 
            else if (piece.id === targetPiece.id) {
              // This is the target piece - move it to dragged piece's original position
              return {
                ...piece,
                currentX: draggedPiece.currentX,
                currentY: draggedPiece.currentY,
                xPos: draggedPiece.currentX * pieceWidth,
                yPos: draggedPiece.currentY * pieceHeight
              };
            }
            // All other pieces stay where they are
            return piece;
          });
        });
        
        setMoves(m => m + 1);
      }
    }
    
    // Reset the element's appearance
    element.classList.remove('dragging');
    element.style.position = '';
    element.style.zIndex = '';
    element.style.left = '';
    element.style.top = '';
    element.style.transform = '';
    
    setDraggingId(null);
  };
  
  const handleTouchStart = (e, id) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to parent elements
    if (!gameStarted) return;
  
    const touch = e.touches[0];
    const element = document.getElementById(`piece-${id}`);
    if (!element) return;
  
    // Get container dimensions fresh each touch
    const container = containerRef.current;
    
    // Calculate positions relative to container
    const offsetX = touch.clientX - containerRect.left - element.offsetLeft;
    const offsetY = touch.clientY - containerRect.top - element.offsetTop;
  
    // Visual feedback
    element.style.transform = "scale(1.02)";
    element.style.transition = "transform 0.1s";
    element.style.zIndex = "1000";
  
    setDraggingId(id);
    setDragOffset({ x: offsetX, y: offsetY });
  };
  
  const handleTouchMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingId) return;
  
    const touch = e.touches[0];
    const element = document.getElementById(`piece-${draggingId}`);
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
  
    // Calculate boundaries
    const pieceWidth = containerRect.width / gridSize;
    const pieceHeight = containerRect.height / gridSize;
    
    // Calculate new position with constraints
    let newX = touch.clientX - containerRect.left - dragOffset.x;
    let newY = touch.clientY - containerRect.top - dragOffset.y;
  
    // Keep pieces within container bounds
    newX = Math.max(0, Math.min(newX, containerRect.width - pieceWidth));
    newY = Math.max(0, Math.min(newY, containerRect.height - pieceHeight));
  
    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;
  };
  
  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingId) return;
  
    const draggedPiece = pieces.find(p => p.id === draggingId);
    const element = document.getElementById(`piece-${draggingId}`);
    const container = containerRef.current;
  
    // Cleanup event listeners first
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  
    if (element) {
      // Reset visual styles
      element.style.transform = '';
      element.style.transition = 'all 0.3s ease';
      element.style.zIndex = '1';
      element.classList.remove('dragging');
      
      // Reset position properties
      element.style.position = '';
      element.style.left = '';
      element.style.top = '';
    }
  
    // Get fresh container measurements
    const containerRect = container.getBoundingClientRect();
    const pieceWidth = containerRect.width / gridSize;
    const pieceHeight = containerRect.height / gridSize;
  
    // Get final touch position
    const touch = e.changedTouches[0];
    const touchX = touch.clientX - containerRect.left;
    const touchY = touch.clientY - containerRect.top;
  
    // Calculate grid position with boundary checks
    const gridX = Math.max(0, Math.min(Math.floor(touchX / pieceWidth), gridSize - 1));
    const gridY = Math.max(0, Math.min(Math.floor(touchY / pieceHeight), gridSize - 1));
  
    // Perform piece swap if valid
    if (draggedPiece) {
      const targetPiece = pieces.find(p => 
        p.currentX === gridX && 
        p.currentY === gridY &&
        p.id !== draggingId
      );
  
      if (targetPiece) {
        setPieces(prevPieces => prevPieces.map(piece => {
          if (piece.id === draggingId) {
            return {
              ...piece,
              currentX: gridX,
              currentY: gridY,
              xPos: gridX * pieceWidth,
              yPos: gridY * pieceHeight
            };
          }
          if (piece.id === targetPiece.id) {
            return {
              ...piece,
              currentX: draggedPiece.currentX,
              currentY: draggedPiece.currentY,
              xPos: draggedPiece.currentX * pieceWidth,
              yPos: draggedPiece.currentY * pieceHeight
            };
          }
          return piece;
        }));
  
        setMoves(m => m + 1);
        
        // Delay solve check for animation completion
        setTimeout(() => {
          const isSolved = pieces.every(p => 
            p.currentX === p.correctX && 
            p.currentY === p.correctY
          );
          setSolved(isSolved);
          if (isSolved) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }
        }, 300);
      }
    }
  
    // Final cleanup
    setDraggingId(null);
    setDragOffset({ x: 0, y: 0 });
    setDragPosition({ x: 0, y: 0 });
  
    // Force reflow for smooth transition
    if (element) {
      element.getBoundingClientRect();
    }
  };
  useEffect(() => {
    // Cleanup function to ensure no lingering event listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []); 

  const [debugInfo, setDebugInfo] = useState({
    lastAction: 'none',
    touchX: 0,
    touchY: 0,
    gridX: 0,
    gridY: 0
  });

  useEffect(() => {
    if (pieces.length > 0 && gameStarted && moves > 0) {
      const isSolved = pieces.every(piece => 
        piece.correctX === piece.currentX && 
        piece.correctY === piece.currentY
      );
  
      if (isSolved) {
        setSolved(true);
        setHasBeenSolved(true);
        setShowConfetti(true); // Show confetti
        setShowSuccessMessage(true); // Show success message
  
        // Hide confetti and success message after 5 seconds
        setTimeout(() => {
          setShowConfetti(false); // Hide confetti
          setShowSuccessMessage(false); // Hide success message
        }, 5000);
      }
    }
  }, [pieces, gameStarted, moves]);

  useEffect(() => {
    if (image) {
      sliceImage();
    }
  }, [image, gridSize, sliceImage]);

  // Add event listeners for mouse movement and touch movement
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (draggingId) {
        handleMouseMove(e);
      }
    };
    
    const handleGlobalMouseUp = (e) => {
      if (draggingId) {
        handleMouseUp(e);
      }
    };
    
    const handleGlobalTouchMove = (e) => {
      if (draggingId) {
        handleTouchMove(e);
      }
    };
    
    const handleGlobalTouchEnd = (e) => {
      if (draggingId) {
        handleTouchEnd(e);
      }
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [draggingId, dragOffset, dragPosition]);

  const PuzzlePiece = ({ piece, onMouseDown, onTouchStart }) => {
    const pieceStyles = {
      position: 'absolute',
      width: `${100/gridSize}%`,
      height: `${100/gridSize}%`,
      left: `${(piece.currentX * 100)/gridSize}%`,
      top: `${(piece.currentY * 100)/gridSize}%`,
      backgroundImage: `url(${piece.originalSrc})`,
      backgroundSize: piece.isAnimated 
        ? `${gridSize * 100}% ${gridSize * 100}%` 
        : `${gridSize * 100}%`,
      backgroundPosition: `${-(piece.correctX * 100)}% ${-(piece.correctY * 100)}%`,
      transition: draggingId === piece.id ? 'none' : 'all 0.3s cubic-bezier(0.2, 0, 0.2, 1)',
      cursor: gameStarted ? 'grab' : 'default',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: draggingId === piece.id ? '0 8px 16px rgba(0,0,0,0.3)' : 'none',
      touchAction: 'none',
      WebkitTapHighlightColor: 'transparent',
      WebkitTouchCallout: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      zIndex: draggingId === piece.id ? '1000' : '1',
      // Mobile optimizations
      willChange: 'transform',
      transform: 'translateZ(0)', // Force hardware acceleration
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      MozOsxFontSmoothing: 'grayscale' // Improve text rendering
    };
  
    return (
      <div
        id={`piece-${piece.id}`}
        className={`puzzle-piece ${draggingId === piece.id ? 'dragging' : ''}`}
        style={pieceStyles}
        onMouseDown={(e) => {
          e.preventDefault();
          onMouseDown(e, piece.id);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onTouchStart(e, piece.id);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
    );
  };

useEffect(() => {
  const handleResize = () => {
    if (image && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const maxWidth = Math.min(containerWidth, image.width);
      const scaleFactor = maxWidth / image.width;
      const height = image.height * scaleFactor;
    }
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [image]);


      const getTotalSupply = async () => {
        try {
          if (!window.ethereum) throw new Error('No Web3 Provider found');
          
          // Check if ethers is properly imported and initialized
          if (!ethers || !ethers.BrowserProvider) {
            console.error('Ethers.js not properly initialized');
            throw new Error('Ethers.js library not available');
          }
          
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          // Make sure PUZZLE_NFT_ABI is properly imported
          if (!PUZZLE_NFT_ABI) {
            console.error('PUZZLE_NFT_ABI is undefined');
            throw new Error('Contract ABI not available');
          }
          
          const contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
            PUZZLE_NFT_ABI,
            provider
          );
          
          // The ABI does contain totalSupply, but we can still check as a best practice
          if (!contract.totalSupply) {
            console.error('totalSupply function not found in contract ABI');
            throw new Error('Contract method not found');
          }
          
          const supply = await contract.totalSupply();
          console.log('✅ Current total supply:', supply.toString());
          
          // Convert to number for easier use in JS
          const totalSupply = Number(supply);
          if (isNaN(totalSupply) || totalSupply < 0) {
            throw new Error("Invalid total supply received");
          }
          
          return totalSupply;
        } catch (error) {
          console.error('❌ Error getting total supply:', error);
          return null;
        }
      };

      const handleMint = async () => {
        try {
          setLoading(true);
          setError(null);
          setMintError(null);
      
          // Mobile detection and deeplinking
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile && !window.ethereum?.isConnected()) {
            const dappUrl = encodeURIComponent(window.location.href);
            window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
            return;
          }
      
          if (!nft) throw new Error("No NFT selected!");
      
          console.log("🧩 Minting NFT with:", nft);
          const { tokenId, collectionName, contractAddress, image } = nft;
      
          if (!tokenId || isNaN(tokenId)) {
            throw new Error("Invalid NFT token ID.");
          }
      
          // Transaction timeout setup (45 seconds)
          const transactionTimeout = 45000;
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transaction timeout. Please try again.')), transactionTimeout)
          );
      
          let result;
          try {
            result = await Promise.race([
              (async () => {
                const currentSupply = await getTotalSupply();
                console.log("📌 Current Supply:", currentSupply);
      
                if (currentSupply === null || isNaN(currentSupply) || currentSupply < 0) {
                  throw new Error("Invalid total supply");
                }
      
                const nextTokenId = currentSupply + 1;
                console.log("✅ Next Token ID:", nextTokenId);
      
                if (nextTokenId === 0 || isNaN(nextTokenId)) {
                  throw new Error("Invalid next token ID");
                }
      
                const ipfsImageUrl = image;
                const arweaveId = await uploadPuzzleHTML(ipfsImageUrl, gridSize, collectionName);
      
                const metadata = createPuzzleMetadata(
                  ipfsImageUrl,
                  gridSize,
                  arweaveId,
                  nextTokenId,
                  tokenId,
                  collectionName,
                  moves,
                  contractAddress
                );
      
                console.log("📝 Metadata Created:", metadata);
                const metadataUrl = await uploadMetadataToIPFS(metadata, nextTokenId);
      
                return await mintPuzzleNFT(
                  metadataUrl, 
                  gridSize, 
                  chainId, 
                  address, 
                  tokenId
                );
              })(),
              timeoutPromise
            ]);
          } catch (error) {
            if (error.code === 4001) throw new Error("User rejected transaction");
            if (error.message.includes('timeout')) throw new Error("Transaction timeout");
            throw error;
          }
      
          if (result.success) {
            setMintStatus({
              status: "success",
              message: "Your Web3 Puzzles NFT has been minted!",
              tokenId: result.tokenId,
              hash: result.hash,
            });
            console.log("✅ Mint successful:", result.tokenId);
          }
      
        } catch (error) {
          console.error("🚨 Mint error:", error);
          setMintStatus({
            status: "error",
            message: error.message,
          });
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

    const renderSelectedNFT = () => {
      if (!nft) return null;
  
  return (
    <div className={`mb-8 rounded-2xl p-6 transition-all duration-500 overflow-hidden animate-fadeIn ${
      isDarkMode 
        ? 'bg-gray-800/60 border border-gray-700 shadow-[0_0_20px_rgba(138,92,246,0.9)]' 
        : 'bg-white/80 border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.1)]'
    }`}>
      <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Selected NFT
      </h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col">
          <div className={`rounded-xl overflow-hidden mb-4 border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <img 
              src={nft.image} 
              alt={nft.name} 
              className="w-full h-auto object-contain"
              onError={(e) => {
                console.error("Image failed to load:", nft.image);
                e.target.src = "/placeholder.jpg";
              }} 
            />
          </div>
          
          <a 
            href={nft.openSeaUrl || `https://testnets.opensea.io/assets/${nft.contractAddress}/${nft.tokenId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
              isDarkMode 
                ? 'bg-blue-600/70 hover:bg-blue-500/70 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <ExternalLink size={18} />
            View on OpenSea
          </a>
        </div>
        
        <div>
          <div className={`rounded-xl p-4 mb-4 ${
            isDarkMode ? 'bg-gray-900/70 text-gray-300' : 'bg-gray-50 text-gray-700'
          }`}>
            <h4 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              NFT Details
            </h4>
            
            <div className="space-y-3">
              <div>
                <span className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Collection:
                </span>
                <span className="font-medium">
                  {nft.collectionName || "Unknown Collection"}
                </span>
              </div>
              <div>
                <span className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Name:
                </span>
                <span className="font-medium">
                  {nft.name}
                </span>
              </div>
              <div>
                <span className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Token ID:
                </span>
                <span className="font-medium">
                  #{nft.tokenId}
                </span>
              </div>
              <div>
                <span className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Contract:
                </span>
                <span className="font-medium truncate">
                  {nft.contractAddress.substring(0, 6)}...{nft.contractAddress.substring(nft.contractAddress.length - 4)}
                </span>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center gap-4 mb-4 p-4 rounded-xl ${
            isDarkMode ? 'bg-purple-900/20 text-purple-300 border border-purple-800/30' : 'bg-purple-50 text-purple-700 border border-purple-100'
          }`}>
            <div className="p-2 rounded-full bg-opacity-20 bg-purple-500">
              <Puzzle size={20} />
            </div>
            <div>
              <p className="font-medium">Ready to create a puzzle?</p>
              <p className="text-sm opacity-80">Your NFT will load on the Generator below.  <br />
                Try and solve the puzzle before Hitting MINT!
                <br />
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Image conversion helper
const convertImageToFile = async (image) => {
  try {
    const response = await fetch(image.src);
    const blob = await response.blob();
    return new File([blob], 'puzzle-image.png', { 
      type: blob.type || 'image/png' 
    });
  } catch (error) {
    console.error('Image conversion failed:', error);
    throw new Error('Failed to process image');
  }
};

// Replace your uploadPuzzleHTML function with this mock version
//const uploadPuzzleHTML = async (htmlContent) => {
  //try {
    //console.log('HTML content would be uploaded to Arweave:', htmlContent);
    
    // Return a mock transaction ID
    //return "mock-arweave-tx-id-for-testing";
  //} catch (error) {
    //console.error('HTML upload failed:', error);
    //throw new Error('Failed to upload puzzle HTML');
  //}
//};

const uploadPuzzleHTML = async (imageUrl, gridSize, collectionName) => {
  try {
    console.log('Preparing HTML content for upload...');
    
    // Pass the gridSize to generateEmbedHTML
    const htmlContent = await generateEmbedHTML(imageUrl, gridSize, collectionName);
    
    const htmlBlob = new Blob([htmlContent], { 
      type: 'text/html;charset=utf-8'
    });

    const arweaveId = await uploadToArweave(htmlBlob, 'text/html');
    console.log('HTML uploaded successfully to Arweave:', arweaveId);
    
    return arweaveId;
  } catch (error) {
    console.error('HTML upload failed:', error);
    throw new Error('Failed to upload puzzle HTML: ' + error.message);
  }
};
  const generateEmbedHTML = async (imageUrl, gridSize, collectionName = 'CPuzzles') => {
    try {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Web3 Puzzles</title>
          <style>
         /* Base Styles */
:root {
  --puzzle-size: min(95vw, 95vh);
  --grid-size: ${gridSize};
  --primary-color: #6366f1;
  --primary-dark: #4f46e5;
  --accent-color: #f59e0b;
  --dark-bg: #0f172a;
  --surface-bg: #1e293b;
  --surface-light: #334155;
  --text-light: #f8fafc;
  --text-dim: #94a3b8;
  --glass-bg: rgba(15, 23, 42, 0.7);
  --button-size: 40px;
  --button-radius: 8px;
  --transition-default: all 0.3s cubic-bezier(0.2, 0, 0.2, 1);
}

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--dark-bg);
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  color: var(--text-light);
  overflow: hidden;
  touch-action: none;
}

/* Frame Styles */
.frame {
  position: relative;
  width: var(--puzzle-size);
  height: var(--puzzle-size);
  background: var(--surface-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 
              0 0 0 1px rgba(255, 255, 255, 0.05),
              0 0 60px rgba(99, 102, 241, 0.15);
  transition: box-shadow 0.5s ease;
}

.frame:hover {
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5), 
              0 0 0 1px rgba(255, 255, 255, 0.1),
              0 0 70px rgba(99, 102, 241, 0.2);
}

/* Puzzle Container */
.puzzle-pieces-container {
  width: 100%;
  height: 100%;
  position: relative;
  transition: filter 0.5s ease;
  touch-action: none;
  cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24">🧩</text></svg>') 16 16, auto;
}

/* Remove reflective line at top */
.puzzle-pieces-container::before {
  content: none;
}

/* Puzzle Piece Styles */
.puzzle-piece {
  position: absolute;
  width: calc(100% / var(--grid-size));
  height: calc(100% / var(--grid-size));
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1), 
              left 0.3s cubic-bezier(0.2, 0, 0.2, 1), 
              top 0.3s cubic-bezier(0.2, 0, 0.2, 1);
  cursor: grab;
  background-size: calc(var(--grid-size) * 100%) calc(var(--grid-size) * 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  z-index: 1;
  box-shadow: inset 0 0 2px rgba(0,0,0,0.15);
}

.puzzle-piece.dragging {
  z-index: 1000;
  opacity: 0.9;
  transform: scale(1.05);
  cursor: grabbing;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5), inset 0 0 3px rgba(255,255,255,0.2);
  transition: none;
}

/* UI element base styles - for show/hide animation */
.ui-element {
  opacity: 0;
  transform: translateY(-5px);
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.ui-element.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.ui-element.active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* Menu Styles - Completely redesigned */
.menu-dots {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 100;
}

.menu-button {
  width: var(--button-size);
  height: var(--button-size);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-default);
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.menu-button:hover, .menu-button.hovering {
  background: var(--primary-color);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.menu-button::before, 
.menu-button::after {
  content: "";
  position: absolute;
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
  transition: var(--transition-default);
}

.menu-button::before {
  transform: translateX(-6px);
}

.menu-button::after {
  transform: translateX(6px);
}

.menu-popup {
  position: absolute;
  top: 110%;
  left: 0;
  margin-top: 10px;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 12px;
  padding: 6px;
  display: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  transform: translateY(-10px);
  opacity: 0;
  transition: var(--transition-default);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.menu-popup.active {
  display: block;
  transform: translateY(0);
  opacity: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
  font-weight: 500;
  margin: 4px 0;
  font-size: 14px;
  letter-spacing: 0.3px;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(2px);
}

/* Collection Info */
.collection-info {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 20px;
  border: none;
  color: white;
  font-size: 13px;
  font-weight: 500;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.5px;
}

.collection-info.hovering {
  background: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Success Message */
.success-message {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: white;
  font-size: 42px;
  font-weight: 700;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s;
  z-index: 2000;
  transform: scale(0.9);
  text-shadow: 0 2px 10px rgba(99, 102, 241, 0.5);
}

.success-message span {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 400;
  opacity: 0.8;
}

.success-message.visible {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1);
  transition: opacity 0.5s, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Pull Up Container - Completely redesigned */
.pull-up-container {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex; 
  align-items: center;
  justify-content: center;
  width: var(--button-size);
}

.pull-up-button {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: var(--button-size);
  height: var(--button-size);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-default);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.pull-up-button:hover {
  background: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(99, 102, 241, 0.4);
}

.arrow {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-right: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(-45deg); /* Makes it look like an upward arrow */
}

.arrow::before {
  content: "";
  position: absolute;
  width: 8px;
  height: 2px;
  background: white;
  transform: rotate(45deg);
  left: 0;
  top: 5px;
}

.arrow::after {
  content: "";
  position: absolute;
  width: 8px;
  height: 2px;
  background: white;
  transform: rotate(-45deg);
  right: 0;
  top: 5px;
}
  .up {
  transform: rotate(-135deg);
}

.grid-options {
  position: absolute;
  bottom: 55px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 8px;
  border-radius: 12px;
  display: none;
  gap: 8px;
  opacity: 0;
  transition: var(--transition-default);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.grid-options.active {
  display: flex;
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.grid-option {
  color: white;
  padding: 8px 14px;
  cursor: pointer;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  transition: var(--transition-default);
  font-weight: 500;
  border: none;
  font-size: 14px;
  letter-spacing: 0.3px;
}

.grid-option:hover {
  background: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4);
}

/* Confetti - Completely redesigned */
.confetti {
  position: absolute;
  top: -10px;
  width: 6px;
  height: 12px;
  background-color: transparent;
  opacity: 0.9;
  transform-origin: center;
  animation: fadeOut 2.5s ease-out forwards;
}

/* Multiple confetti types */
.confetti:nth-child(4n) {
  background-color: var(--primary-color);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

.confetti:nth-child(4n+1) {
  background-color: var(--accent-color);
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

.confetti:nth-child(4n+2) {
  background-color: #10b981; /* Emerald */
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.confetti:nth-child(4n+3) {
  background-color: #ec4899; /* Pink */
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  width: 10px;
  height: 10px;
}

@keyframes fadeOut {
  0% { opacity: 1; transform: translateY(0) rotate(0deg); }
  100% { opacity: 0; transform: translateY(100px) rotate(360deg); }
}

/* Invert hover effect - simplified */
.invert-hover.hovering {
  background: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Additional styling for menu items */
.menu-item[data-action="shuffle"] {
  display: flex;
  align-items: center;
}

.menu-item[data-action="shuffle"]::before {
  content: "↻";
  margin-right: 8px;
  font-size: 16px;
}

.menu-item[data-action="reset"] {
  display: flex;
  align-items: center;
}

.menu-item[data-action="reset"]::before {
  content: "⟳";
  margin-right: 8px;
  font-size: 16px;
}

.menu-item[data-action="effects"] {
  display: flex;
  align-items: center;
}

.menu-item[data-action="effects"]::before {
  content: "✨";
  margin-right: 8px;
  font-size: 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .menu-item {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .pull-up-button {
    width: 70px;
    height: 30px;
  }
  
  .collection-info {
    font-size: 12px;
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
  :root {
    --button-size: 36px;
  }
  
  .menu-popup {
    min-width: 140px;
  }
  
  .success-message {
    font-size: 36px;
  }

  properties: {
  ...otherProperties,
  original_width: image.width,  // ✅ Original width
  original_height: image.height // ✅ Original height
}
  
  .success-message span {
    font-size: 16px;
  }
}
          </style>
        </head>
        <body>
          <div class="frame">
  <div class="collection-info ui-element invert-hover">
    ${collectionName}
  </div>

  <div class="menu-dots ui-element invert-hover">
    <button class="menu-button" onclick="toggleMenu()">≡</button>
    <div id="menu-popup" class="menu-popup">
      <a href="#" class="menu-item" onclick="cycleEffects()">✨ Effects</a>
      <a href="#" class="menu-item" onclick="shufflePieces()">🔄 Shuffle</a>
      <a href="#" class="menu-item" onclick="resetPuzzle()">🧩 Reset</a>
    </div>
  </div>

  <div id="puzzle-container" class="puzzle-pieces-container"></div>

  <div class="success-message" id="success-message">
    <div>Puzzle Solved! 🎉</div>
    <span>Click anywhere to continue playing</span>
  </div>

  <div class="pull-up-container ui-element" id="grid-options-container">
    <div class="grid-options" id="grid-options">
      <div class="grid-option" onclick="changeGridSize(2)">2×2</div>
      <div class="grid-option" onclick="changeGridSize(3)">3×3</div>
      <div class="grid-option" onclick="changeGridSize(4)">4×4</div>
      <div class="grid-option" onclick="changeGridSize(5)">5×5</div>
    </div>
    <button class="pull-up-button invert-hover" onclick="toggleGridOptions()">▲</button>
    </button>
  </div>

  <div class="confetti-container" id="confetti-container"></div>
</div>
          
  
          <script>
            // State Management
            let pieces = [];
            let selectedPiece = null;
            let dragOffset = { x: 0, y: 0 };
            let dragPosition = { x: 0, y: 0 };
            let isSolved = false;
            let successMessageTimeout = null;
            let currentGridSize = ${gridSize};
            let isGridOptionsActive = false;
            let currentImage = null;
  
            // Effects Configuration
            const effects = [
  { name: 'Normal', filter: 'none' },
  { name: 'Invert', filter: 'invert(100%)' },
  { name: 'Neon', filter: 'saturate(200%) brightness(150%) contrast(120%)' },
  { name: 'Synthwave', filter: 'hue-rotate(320deg) saturate(250%) brightness(90%) contrast(140%)' },
  { name: 'Hologram', filter: 'hue-rotate(210deg) saturate(180%) brightness(130%) contrast(110%) blur(0.3px)' },
  { name: 'Glitch', filter: 'hue-rotate(90deg) saturate(200%) contrast(150%) brightness(120%)' },
  { name: "Vaporwave", filter: "hue-rotate(310deg) saturate(180%) brightness(110%) contrast(110%)" },
  { name: "Midnight", filter: "brightness(80%) contrast(120%) hue-rotate(210deg) saturate(130%)" },
  { name: "Radioactive", filter: "sepia(20%) hue-rotate(90deg) saturate(300%) brightness(110%) contrast(130%)" },
  { name: "Arctic", filter: "brightness(110%) contrast(110%) hue-rotate(170deg) saturate(70%) blur(0.5px)" },
  { name: "Dystopian", filter: "grayscale(50%) contrast(150%) brightness(80%) sepia(20%)" },
  { name: "Infrared", filter: "hue-rotate(150deg) saturate(200%) contrast(130%) brightness(110%)" },
  { name: "Acid", filter: "hue-rotate(70deg) saturate(300%) contrast(140%) brightness(130%)" },
  { name: "Eternity", filter: "grayscale(30%) hue-rotate(200deg) saturate(130%) brightness(90%) contrast(120%)" },
  { name: "Chrome", filter: "grayscale(100%) brightness(130%) contrast(150%)" },
  { name: "Eclipse", filter: "brightness(70%) contrast(150%) saturate(120%)" },
  { name: 'Thermal', filter: 'saturate(300%) brightness(100%) contrast(150%) hue-rotate(30deg)' },
  { name: 'Frostbite', filter: 'hue-rotate(180deg) saturate(150%) brightness(110%) contrast(130%) blur(0.3px)' },
  { name: 'Ultraviolet', filter: 'brightness(100%) contrast(140%) saturate(200%) hue-rotate(270deg)' },
  { name: 'Nebula', filter: 'hue-rotate(230deg) saturate(250%) brightness(90%) contrast(130%) blur(0.2px)' }
];
            let currentEffect = 0;
  
            // Initialize puzzle
            function initPuzzle() {
              const container = document.getElementById('puzzle-container');
              const image = new Image();
              
              image.onload = () => {
                currentImage = image;
                createPieces(image, currentGridSize);
                shufflePieces();
              };
              
              image.src = "${imageUrl}";
  
              // Prevent default behaviors
              container.addEventListener('dragstart', e => e.preventDefault());
              container.addEventListener('drop', e => e.preventDefault());
              
              // Close success message when clicked
              document.getElementById('success-message').addEventListener('click', () => {
                document.getElementById('success-message').classList.remove('visible');
              });
            }
  
            function initTouchEvents() {
              const container = document.getElementById('puzzle-container');
              
              // Prevent default touch actions on the puzzle container
              container.addEventListener('touchstart', function(e) {
                if (e.target.classList.contains('puzzle-piece')) {
                  e.preventDefault();
                }
              }, { passive: false });
              
              // Prevent scrolling while interacting with puzzle
              document.body.addEventListener('touchmove', function(e) {
                if (selectedPiece) {
                  e.preventDefault();
                }
              }, { passive: false });
            }
  
            // Create puzzle pieces
            function createPieces(image, newGridSize) {
              const container = document.getElementById('puzzle-container');
              container.innerHTML = '';
              pieces = [];
  
              const pieceWidth = 100 / newGridSize;
              const pieceHeight = 100 / newGridSize;
  
              for (let y = 0; y < newGridSize; y++) {
                for (let x = 0; x < newGridSize; x++) {
                  const piece = document.createElement('div');
                  piece.className = 'puzzle-piece';
                  piece.id = \`piece-\${x}-\${y}\`;
                  
                  piece.style.width = \`\${pieceWidth}%\`;
                  piece.style.height = \`\${pieceHeight}%\`;
                  
                  // Create proper background positioning
                  const bgSize = newGridSize * 100;
                  const bgPosX = -(x * 100);
                  const bgPosY = -(y * 100);
                  
                  piece.style.backgroundImage = \`url(\${image.src})\`;
                  piece.style.backgroundPosition = \`\${bgPosX}% \${bgPosY}%\`;
                  piece.style.backgroundSize = \`\${bgSize}% \${bgSize}%\`;
                  piece.style.position = 'absolute';
                  
                  // Add subtle inner shadow for depth
                  piece.style.boxShadow = 'inset 0 0 2px rgba(0,0,0,0.2)';
  
                  piece.dataset.correctX = x;
                  piece.dataset.correctY = y;
                  piece.dataset.currentX = x;
                  piece.dataset.currentY = y;
  
                  piece.addEventListener('mousedown', handleMouseDown);
                  piece.addEventListener('touchstart', handleTouchStart, { passive: false });
                  
                  container.appendChild(piece);
                  pieces.push(piece);
                  
                  updatePiecePosition(piece);
                }
              }
            }
  
            // Update piece position
            function updatePiecePosition(piece) {
              if (!piece) return;
              
              const x = parseInt(piece.dataset.currentX);
              const y = parseInt(piece.dataset.currentY);
              const gridSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));
              
              piece.style.left = \`\${(x * 100) / gridSize}%\`;
              piece.style.top = \`\${(y * 100) / gridSize}%\`;
            }
  
            // Mouse event handlers
            function handleMouseDown(e) {
              e.preventDefault();
              
              // Don't allow movement if puzzle is solved
              if (isSolved) return;
              
              const piece = e.target;
              
              const rect = piece.getBoundingClientRect();
              const container = document.getElementById('puzzle-container');
              const containerRect = container.getBoundingClientRect();
              
              dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              };
              
              selectedPiece = piece;
              piece.style.zIndex = '1000';
              piece.classList.add('dragging');
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }
  
            function handleMouseMove(e) {
              if (!selectedPiece) return;
              e.preventDefault();
              
              const container = document.getElementById('puzzle-container');
              const rect = container.getBoundingClientRect();
              
              const x = e.clientX - rect.left - dragOffset.x;
              const y = e.clientY - rect.top - dragOffset.y;
              
              selectedPiece.style.left = \`\${x}px\`;
              selectedPiece.style.top = \`\${y}px\`;
            }
  
            function handleMouseUp(e) {
              if (!selectedPiece) return;
              e.preventDefault();
              
              const container = document.getElementById('puzzle-container');
              const rect = container.getBoundingClientRect();
              
              const mouseX = e.clientX - rect.left;
              const mouseY = e.clientY - rect.top;
              
              const gridSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));
              const gridX = Math.floor((mouseX / rect.width) * gridSize);
              const gridY = Math.floor((mouseY / rect.height) * gridSize);
              
              if (isValidPosition(gridX, gridY)) {
                handlePieceSwap(gridX, gridY);
              }
              
              resetDraggedPiece();
            }
  
            // Touch event handlers
            function handleTouchStart(e) {
              e.preventDefault();
              
              // Don't allow movement if puzzle is solved
              if (isSolved) return;
              
              const touch = e.touches[0];
              const piece = e.target;
              
              const rect = piece.getBoundingClientRect();
              dragOffset = {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
              };
              
              selectedPiece = piece;
              piece.style.zIndex = '1000';
              piece.classList.add('dragging');
              
              document.addEventListener('touchmove', handleTouchMove, { passive: false });
              document.addEventListener('touchend', handleTouchEnd);
            }
  
            function handleTouchMove(e) {
              if (!selectedPiece) return;
              e.preventDefault();
              
              const touch = e.touches[0];
              const container = document.getElementById('puzzle-container');
              const rect = container.getBoundingClientRect();
              
              const x = touch.clientX - rect.left - dragOffset.x;
              const y = touch.clientY - rect.top - dragOffset.y;
              
              selectedPiece.style.left = x + 'px';
              selectedPiece.style.top = y + 'px';
            }
  
            function handleTouchEnd(e) {
              if (!selectedPiece) return;
              e.preventDefault();
              
              const container = document.getElementById('puzzle-container');
             const rect = container.getBoundingClientRect();
const touch = e.changedTouches[0];

const touchX = touch.clientX - rect.left;
const touchY = touch.clientY - rect.top;

const gridSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));
const gridX = Math.floor((touchX / rect.width) * gridSize);
const gridY = Math.floor((touchY / rect.height) * gridSize);

if (isValidPosition(gridX, gridY)) {
  handlePieceSwap(gridX, gridY);
}

resetDraggedPiece();

document.removeEventListener('touchmove', handleTouchMove);
document.removeEventListener('touchend', handleTouchEnd);
}
  
function isValidPosition(x, y) {
  const gridSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));
  return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
}
  
function resetDraggedPiece() {
  if (!selectedPiece) return;
  
  selectedPiece.classList.remove('dragging');
  selectedPiece.style.zIndex = '';
  
  // Reset to grid position
  const x = parseInt(selectedPiece.dataset.currentX);
  const y = parseInt(selectedPiece.dataset.currentY);
  updatePiecePosition(selectedPiece);
  
  selectedPiece = null;
  
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  
  checkSolution();
}
  
function handlePieceSwap(targetX, targetY) {
  const targetPiece = pieces.find(piece => {
    return parseInt(piece.dataset.currentX) === targetX && 
           parseInt(piece.dataset.currentY) === targetY;
  });
  
  if (!targetPiece || targetPiece === selectedPiece) {
    return;
  }
  
  // Swap current positions
  const selectedX = parseInt(selectedPiece.dataset.currentX);
  const selectedY = parseInt(selectedPiece.dataset.currentY);
  
  selectedPiece.dataset.currentX = targetX;
  selectedPiece.dataset.currentY = targetY;
  
  targetPiece.dataset.currentX = selectedX;
  targetPiece.dataset.currentY = selectedY;
  
  // Update visual positions
  updatePiecePosition(selectedPiece);
  updatePiecePosition(targetPiece);
}
  
function checkSolution() {
  if (isSolved) return;
  
  const allCorrect = pieces.every(piece => {
    const currentX = parseInt(piece.dataset.currentX);
    const currentY = parseInt(piece.dataset.currentY);
    const correctX = parseInt(piece.dataset.correctX);
    const correctY = parseInt(piece.dataset.correctY);
    
    return currentX === correctX && currentY === correctY;
  });
  
  if (allCorrect) {
    isSolved = true;
    celebrateSolution();
  }
}
  
function celebrateSolution() {
  // Show success message
  const successMessage = document.getElementById('success-message');
  successMessage.classList.add('visible');
  
  // Create confetti
  const confettiContainer = document.getElementById('confetti-container');
  const confettiCount = 150;
  
  // Configure confetti physics
  const gravity = 0.1;
  const drag = 0.05;
  const terminalVelocity = 5;
  
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      createConfetti(confettiContainer, gravity, drag, terminalVelocity);
    }, i * 20);
  }
  
  // Add event listener to close success message
  if (successMessageTimeout) {
    clearTimeout(successMessageTimeout);
  }
  
  successMessageTimeout = setTimeout(() => {
    successMessage.addEventListener('click', () => {
      successMessage.classList.remove('visible');
      successMessageTimeout = null;
    }, { once: true });
  }, 500);
}
  
function createConfetti(confettiContainer, gravity, drag, terminalVelocity) {
  const confetti = document.createElement('span');
  confetti.className = 'confetti';
  confetti.style.width = Math.random() * 10 + 'px';
  confetti.style.height = confetti.style.width;
  confetti.style.backgroundColor = getRandomColor();
  confetti.style.position = 'absolute';
  confetti.style.left = Math.random() * 100 + '%';
  confetti.style.top = '-5%'; // Start from above
  confetti.style.zIndex = 1000;
  confetti.style.opacity = Math.random() * 0.7 + 0.3;
  confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
  confetti.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';

  confettiContainer.appendChild(confetti);

  // Physics properties
  const angle = Math.random() * Math.PI * 2;
  const velocity = 5 + Math.random() * 10;
  const vx = Math.cos(angle) * velocity;
  const vy = Math.sin(angle) * velocity;
  
  function animate() {
    // Update physics
    confetti.vx = vx;
    confetti.vy = (confetti.vy || 0) + gravity;
    confetti.vy = Math.min(confetti.vy, terminalVelocity);
    
    // Apply drag
    confetti.vx *= (1 - drag);
    
    // Update position
    confetti.style.left = 'calc(' + confetti.style.left + ' + ' + confetti.vx + 'px)';
    confetti.style.top = 'calc(' + confetti.style.top + ' + ' + confetti.vy + 'px)';
    confetti.style.transform = 'rotate(' + (parseFloat(confetti.style.transform.replace('rotate(', '').replace('deg)', '')) + 2) + 'deg)';
    
    // Check if off screen
    const rect = confetti.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.left > window.innerWidth || rect.right < 0) {
      confetti.remove();
      return;
    }
    
    requestAnimationFrame(animate);
  }
  
  requestAnimationFrame(animate);
}
  
function getRandomColor() {
  const colors = [
    '#FF577F', // Pink
    '#FF884B', // Orange
    '#FFBD9B', // Peach
    '#F9F871', // Yellow
    '#A9F679', // Lime
    '#79F8F8', // Cyan
    '#79C1F8', // Light Blue
    '#7B79F8', // Blue
    '#C679F8', // Purple
    '#F879F8', // Magenta
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
  
function shufflePieces() {
  if (isSolved) {
    // Reset solved state if shuffling again
    isSolved = false;
    document.getElementById('success-message').classList.remove('visible');
  }
  
  const gridSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));
  const positions = [];
  
  // Create list of all grid positions
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      positions.push({ x, y });
    }
  }
  
  // Shuffle the positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Assign shuffled positions to pieces
  pieces.forEach((piece, index) => {
    const pos = positions[index];
    piece.dataset.currentX = pos.x;
    piece.dataset.currentY = pos.y;
    updatePiecePosition(piece);
  });
}
  
function resetPuzzle() {
  isSolved = false;
  document.getElementById('success-message').classList.remove('visible');
  
  pieces.forEach(piece => {
    const correctX = parseInt(piece.dataset.correctX);
    const correctY = parseInt(piece.dataset.correctY);
    
    piece.dataset.currentX = correctX;
    piece.dataset.currentY = correctY;
    
    updatePiecePosition(piece);
  });
}

function toggleGridOptions() {
  const gridOptions = document.getElementById('grid-options');
  isGridOptionsActive = !isGridOptionsActive;
  
  if (isGridOptionsActive) {
    gridOptions.classList.add('active');
  } else {
    gridOptions.classList.remove('active');
  }
}
  
function changeGridSize(size) {
  if (size === currentGridSize) return;
  
  document.documentElement.style.setProperty('--grid-size', size);
  currentGridSize = size;
  
  if (currentImage) {
    createPieces(currentImage, currentGridSize);
    shufflePieces();
  }
  
  toggleGridOptions();
}
  
function toggleMenu() {
  const menuPopup = document.getElementById('menu-popup');
  menuPopup.classList.toggle('active');
}
  
function cycleEffects() {
  currentEffect = (currentEffect + 1) % effects.length;
  const container = document.getElementById('puzzle-container');
  container.style.filter = effects[currentEffect].filter;
  
}
  
window.addEventListener('load', () => {
  initPuzzle();
  initTouchEvents();
  initUIInteractions();
});

function initUIInteractions() {
  const frame = document.querySelector('.frame');
  const uiElements = document.querySelectorAll('.ui-element');
  
  // Show/hide UI elements based on mouse/touch interaction with frame
  frame.addEventListener('mouseenter', () => {
    uiElements.forEach(el => el.classList.add('visible'));
  });
  
  frame.addEventListener('mouseleave', () => {
    uiElements.forEach(el => {
      if (!el.classList.contains('active')) {
        el.classList.remove('visible');
      }
    });
    
    // Also close any open menus
    document.getElementById('menu-popup').classList.remove('active');
    
    if (isGridOptionsActive) {
      document.getElementById('grid-options').classList.remove('active');
      isGridOptionsActive = false;
    }
  });
  
  // Add touch support for showing UI elements
  frame.addEventListener('touchstart', () => {
    uiElements.forEach(el => el.classList.add('visible'));
    
    // Auto-hide UI after 3 seconds of inactivity
    clearTimeout(uiHideTimeout);
    uiHideTimeout = setTimeout(() => {
      if (!document.getElementById('menu-popup').classList.contains('active') && 
          !isGridOptionsActive) {
        uiElements.forEach(el => el.classList.remove('visible'));
      }
    }, 3000);
  });
  
  // Add hover effect for buttons and collection name
  const invertHoverElements = document.querySelectorAll('.invert-hover');
  invertHoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.classList.add('hovering');
    });
    
    el.addEventListener('mouseleave', () => {
      el.classList.remove('hovering');
    });
  });
}

let uiHideTimeout;
  
document.addEventListener('click', (e) => {
  const menuButton = document.querySelector('.menu-button');
  const menuPopup = document.getElementById('menu-popup');
  
  if (menuPopup.classList.contains('active') && 
      !menuPopup.contains(e.target) && 
      e.target !== menuButton) {
    menuPopup.classList.remove('active');
  }
  
  const pullUpButton = document.querySelector('.pull-up-button');
  const gridOptions = document.getElementById('grid-options');
  
  if (gridOptions.classList.contains('active') && 
      !gridOptions.contains(e.target) && 
      e.target !== pullUpButton) {
    gridOptions.classList.remove('active');
    isGridOptionsActive = false;
  }
});
        </script>
      </body>
      </html>
    `;
  } catch (error) {
    console.error('Error generating embed HTML:', error);
    return `<p>Error generating puzzle: ${error.message}</p>`;
  }
};

const containerStyles = {
  // Layout and sizing
  position: 'relative',
  width: containerDimensions.width > 0 ? `${containerDimensions.width}px` : '100%',
  height: containerDimensions.height > 0 ? `${containerDimensions.height}px` : 'auto',
  aspectRatio: image?.width && image?.height ? `${image.width}/${image.height}` : '1/1',
  
  // Touch interaction
  touchAction: 'none',
  WebkitTouchCallout: 'none',
  WebkitTapHighlightColor: 'transparent',
  WebkitUserSelect: 'none',
  userSelect: 'none',
  
  // Visual styling
  overflow: 'visible',
  borderRadius: '16px',
  border: isDarkMode 
    ? '2px solid rgba(255, 255, 255, 0.1)' 
    : '2px solid rgba(0, 0, 0, 0.1)',
  boxShadow: isDarkMode
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  
  // Responsive behavior
  margin: '0 auto',
  maxWidth: '100%',
  transition: 'all 0.3s ease',
  
  // Performance optimizations
  backfaceVisibility: 'hidden',
  willChange: 'transform',
  transform: 'translateZ(0)'
};

return (
  <section id="create" className="py-12 relative transition-all duration-500"
  style={{
    background: isDarkMode 
      ? 'radial-gradient(circle at center, #1a1a2e 0%, #16213e 50%, #0f172a 100%)' 
      : 'radial-gradient(circle at center, #e0f2fe 0%, #bfdbfe 50%, #93c5fd 100%)'
  }}>
  {/* Theme Toggle Button */}
  <button 
    onClick={() => setIsDarkMode(!isDarkMode)}
    className="absolute top-4 right-4 p-3 rounded-full transition-all duration-500 hover:scale-105 cursor-pointer"
    style={{
      background: isDarkMode 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0,0,0,0.1)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      boxShadow: isDarkMode 
        ? '0 0 20px rgba(255,255,255,0.15)' 
        : '0 0 20px rgba(0,0,0,0.15)',
      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      width: '56px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    <div className="transition-all duration-500 transform" 
      style={{
        opacity: isDarkMode ? 1 : 0,
        position: 'absolute',
        transform: isDarkMode ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-90deg)'
      }}>
      <Sun className="text-yellow-300" size={32} />
    </div>
    <div className="transition-all duration-500 transform"
      style={{
        opacity: isDarkMode ? 0 : 1,
        position: 'absolute',
        transform: isDarkMode ? 'scale(0.5) rotate(90deg)' : 'scale(1) rotate(0deg)'
      }}>
      <Moon className="text-indigo-700" size={32} />
    </div>
  </button>

  {/* Animated Background Elements */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div 
        key={i}
        className="absolute rounded-full opacity-70"
        style={{
          width: Math.random() * 100 + 50 + 'px',
          height: Math.random() * 100 + 50 + 'px',
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          background: isDarkMode 
            ? `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 255)}, 0.2)` 
            : `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 255)}, 0.3)`,
          animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
          animationDelay: `${Math.random() * 5}s`
        }}
      />
    ))}
  </div>
  

  <div className="relative mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 relative z-10">
    <div className="text-center mb-12 animate-fadeIn">
      <h2 className={`text-5xl font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Puzzle Generator
      </h2>
      <p className={`text-xl transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
        {nft ? 'Create a puzzle from your selected NFT' : 'Create a puzzle from your selected NFT'}
      </p>
    </div>

    {/* Render selected NFT section if an NFT is provided */}
    {nft && renderSelectedNFT()}

    <div className={`max-w-4xl mx-auto rounded-2xl transition-all duration-500 animate-slideUp ${
  isDarkMode 
    ? 'bg-gray-800/60 border border-gray-700 shadow-[0_0_20px_rgba(138,92,246,0.9)]' 
    : 'bg-white/80 border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.1)]'
}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 p-4 sm:p-8">
      
          {/* Grid Size and Collection Input */}
          <div className="space-y-12">
            {/* Grid Size */}
            <div>
              <label className={`block mb-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Grid Size</label>
              <div className="flex gap-2 flex-wrap">
                {[2, 3, 4, 5].map(size => (
                  <button
                    key={size}
                    onClick={() => setGridSize(size)}
                    className={`px-8 py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      gridSize === size
                        ? isDarkMode 
                          ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(138,92,246,0.5)]' 
                          : 'bg-purple-600 text-white shadow-md'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {size}x{size}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset and Shuffle Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  if (image) sliceImage(); // ✅ Ensures puzzle pieces refresh with new image
                }}
                className={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  !image ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                } ${
                  isDarkMode 
                    ? 'bg-indigo-600/80 text-white hover:bg-indigo-500' 
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
                disabled={!image}
              >
                <RotateCw size={18} />
                Reset
              </button>
              <button
  onClick={shufflePieces}
  onTouchStart={(e) => {
    e.stopPropagation(); // Prevent touch event from bubbling to puzzle container
    e.preventDefault(); // Prevent default touch behavior
    shufflePieces();
  }}
  className={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
    !image ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
  } ${
    isDarkMode 
      ? 'bg-purple-600/80 text-white hover:bg-purple-500' 
      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
  }`}
  style={{
    touchAction: 'manipulation', // Improve touch responsiveness
    userSelect: 'none',
    WebkitUserSelect: 'none',
  }}
  disabled={!image}
>
  <Shuffle size={18} />
  Shuffle
</button>
             {/* Button to Cycle Effects */}
      <button
        onClick={cycleEffects}
        className={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
          !image ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
        } ${
          isDarkMode 
            ? 'bg-purple-600/80 text-white hover:bg-purple-500' 
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        }`}
        disabled={!image}
      >
        Effect: {colorEffects[currentEffect].name}
      </button>
            </div>
          </div>

          
        

        {/* Puzzle Preview Section with glass morphism effect */}
        <div 
          className="flex flex-col space-y-4"
        >
          <div 
            className={`rounded-2xl transition-all duration-500 relative overflow-hidden ${
              isDarkMode 
                ? 'bg-gray-900/50 backdrop-blur-md border border-gray-700/50' 
                : 'bg-white/30 backdrop-blur-md border border-white/50'
            }`}
          >
            {/* NFT Token Preview when minted */}
            {mintStatus.status === 'success' && (
              <div className="absolute top-2 right-2 z-20">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold animate-pulse ${
                  isDarkMode ? 'bg-green-900/70 text-green-300' : 'bg-green-100 text-green-700'
                }`}>
                  Minted #{mintStatus.tokenId}
                </div>
              </div>
            )}
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div style={{ 
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch'
}}>
           <div 
  ref={containerRef}
  key={image?.src} // ← Add this
  className="puzzle-container relative mx-auto w-full overflow-visible"
  style={containerStyles}
>
    {/* Preview Image */}
    {image && !gameStarted && (
      <img
        src={image.src}
        alt="Preview"
        className="absolute inset-0 w-full h-full object-contain animate-fadeIn"
        style={{
          filter: isDarkMode ? 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' : 'none',
          objectFit: 'contain',
          filter: colorEffects[currentEffect].filter,
          objectPosition: 'center',
        }}
      />
    )}
{/* Puzzle Pieces */}
    {gameStarted && (
      <div className="puzzle-pieces-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {pieces.map(piece => (
          <PuzzlePiece
            key={piece.id}
            piece={piece}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    )}    
              {/* Success Message */}
              {showSuccessMessage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-2xl font-bold animate-fadeInScale">
                  <div className="transform rotate-3 bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4 rounded-xl shadow-xl">
                    Puzzle Solved! 🎉
                  </div>
                </div>
              )}

              {/* Confetti */}
              {showConfetti && (
                <Confetti
                  width={width}
                  height={height}
                  gravity={0.05}
                  numberOfPieces={200}
                  recycle={false}
                  onConfettiComplete={() => setShowConfetti(false)}
                />
              )}
              
              {showEffectOverlay && (
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm transition-opacity duration-300" />
              )}
            </div>
          </div>
          </div>
          
          {/* Game Status */}
          <div className={`rounded-xl p-4 flex justify-between items-center ${
            isDarkMode 
              ? 'bg-gray-800/50 text-gray-300' 
              : 'bg-white/50 text-gray-700'
          }`}>
            <div className="flex items-center gap-2">
              <Puzzle className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} size={20} />
              <span className="font-medium">
                {gameStarted 
                  ? `Moves: ${moves}` 
                  : 'Ready to play'}
              </span>
            </div>
            <div>
              {solved && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-500">
                  Solved!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

{/* Minting and Sharing Section */}
<div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
  <div className="flex flex-wrap gap-4">
  <button
  onClick={() => handleMint(nft)} // ✅ Pass the selected NFT to handleMint
  disabled={!nft || loading}
  className={`flex-1 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold
  ${(!nft || loading) 
    ? 'opacity-50 cursor-not-allowed' 
    : 'hover:shadow-lg hover:translate-y-[-2px]'
    } ${
      isDarkMode 
        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
        : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
    }`}
>
  {loading ? (
    <>
      <div className="animate-spin h-5 w-5 rounded-full border-2 border-white border-t-transparent"></div>
      <span>Processing...</span>
    </>
  ) : (
    <>
      <span className="text-lg">Mint as NFT</span>
    </>
  )}
</button>

            {/* Sharing Button with animated menu */}
            <div className="relative flex-1">
              <button
                className={`w-full py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold ${
                  !image || !solved 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:translate-y-[-2px]'
                } ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setShowShareMenu(prev => !prev)}
                disabled={!image || !solved}
              >
                <Share2 size={20} />
                <span className="text-lg">Share</span>
              </button>

              {/* Enhanced Sharing Menu */}
              {showShareMenu && image && solved && (
                <div className={`absolute top-full mt-2 right-0 rounded-xl shadow-xl border z-50 w-64 overflow-hidden 
                  animate-fadeInDown ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className={`text-base font-medium p-3 border-b ${
                    isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
                  }`}>
                    Share your achievement
                  </div>

                  <div className="p-2">
                    {[
                      { 
                        name: 'X (Twitter)',
                        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isDarkMode ? 'text-blue-400' : 'text-blue-500'}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>,
                        url: `https://x.com/intent/tweet?text=${encodeURIComponent(`I solved a ${gridSize}x${gridSize} puzzle in ${moves} moves!`)}&url=${encodeURIComponent(window.location.href)}`
                      }
                    ].map((platform, index) => (
                      <a
                        key={index}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 hover:rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={(e) => { }}
                      >
                        {platform.icon}
                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                          Share on {platform.name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Minting Status and Connection Info with improved visuals */}
          <div className={`mt-6 pt-4 border-t grid md:grid-cols-2 gap-4 ${
            isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'
          }`}>
            <div>
            <div className="flex items-center gap-2 mb-2">
  <div className={`w-2 h-2 rounded-full ${
    remainingMints > 0 
      ? (isDarkMode ? 'bg-green-400' : 'bg-green-500') 
      : (isDarkMode ? 'bg-red-400' : 'bg-red-500')
  }`}></div>
  <p className="text-sm">
    <span className="font-medium">{mintedCount}</span> minted, 
    <span className="font-medium"> {remainingMints}</span> remaining 
    <span className="text-gray-400"> (max {MAX_PER_WALLET})</span>
  </p>
</div>
              {mintStatus.status === 'success' && (
  <div className={`p-3 rounded-lg ${
    isDarkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-700'
  }`}>
    <p className="text-sm flex items-center gap-2">
      <CheckCircle size={16} />
      Successfully minted! Collection Token #{mintStatus.tokenId}{' '}
      <a
        href={`https://testnets.opensea.io/assets/base_sepolia/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${mintStatus.tokenId}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`font-medium underline ${
          isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'
        }`}
      >
        View on OpenSea
      </a>
      </p>
      <p className="text-xs mt-1 text-gray-400">
      Total Minted: {mintStatus.totalSupply}
    </p>
  </div>
)}
            </div>

            <div className={`text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                address 
                  ? (isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700')
                  : (isDarkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700')
              }`}>
                {address ? (
                  <span className="flex items-center gap-1">
                    <Shield size={12} /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <AlertCircle size={12} /> Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs">
                {address ? (
                  <>
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </>
                ) : (
                  'Connect wallet to mint'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NFT Display Section with TokenURI preview */}
      {mintStatus.status === 'success' && (
        <div className={`max-w-4xl mx-auto mt-8 rounded-2xl transition-all duration-500 overflow-hidden animate-fadeIn ${
          isDarkMode 
            ? 'bg-gray-800/60 border border-gray-700 shadow-[0_0_20px_rgba(138,92,246,0.2)]' 
            : 'bg-white/80 border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.1)]'
        }`}>
          <div className="p-6">
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Your Minted NFT Details
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className={`rounded-xl overflow-hidden mb-4 border ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <img 
                    src={image?.src} 
                    alt="NFT Preview" 
                    className="w-full h-auto"
                    style={{
                      width: `${image.width}px`,   
                      height: `${image.height}px`, 
                      objectFit: 'contain'        // Ensures proper scaling
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <a
                    href={`https://testnets.opensea.io/assets/base_sepolia/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${mintStatus.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-3 px-4 rounded-lg text-center font-medium transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-blue-600/70 hover:bg-blue-500/70 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ExternalLink size={18} />
                      View on OpenSea
                    </div>
                  </a>
                  
                  <a
                    href={`https://sepolia.basescan.org/token/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}?a=${mintStatus.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-3 px-4 rounded-lg text-center font-medium transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Search size={18} />
                      View on BaseScan
                    </div>
                  </a>
                </div>
              </div>
              
              <div>
              <div className={`rounded-xl p-4 mb-4 ${
  isDarkMode ? 'bg-gray-900/70 text-gray-300' : 'bg-gray-50 text-gray-700'
}`}>
  <h4 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
    TokenURI Metadata
  </h4>
  
  <div className="space-y-3">
  {mintStatus.status === 'success' && mintStatus.tokenId ? (
    <>
      <div>
        <span className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Name:
        </span>
        <span className="font-medium">
          Puzzle #{mintStatus.tokenId}
        </span>
      </div>
      <div>
        <span className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Collection Token ID:
        </span>
        <span className="font-medium">
          #{mintStatus.tokenId}
        </span>
      </div>
      <div>
  <span className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
    Total Minted:
  </span>
  <span className="font-medium">
    {mintStatus.totalSupply}
  </span>
</div>
        <div>
          <span className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Description:
          </span>
          <span className="font-medium">
            Interactive puzzle NFT with {gridSize}x{gridSize} grid configuration
          </span>
        </div>
        <div>
          <span className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Attributes:
          </span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className={`rounded-lg p-2 text-sm ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <span className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Grid Size:
              </span>
              <span className="font-medium">{gridSize}x{gridSize}</span>
            </div>
            <div className={`rounded-lg p-2 text-sm ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <span className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Token ID:
              </span>
              <span className="font-medium">#{mintStatus.tokenId}</span>
            </div>
            <div className={`rounded-lg p-2 text-sm ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <span className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Moves:
              </span>
              <span className="font-medium">{moves}</span>
            </div>
            <div className={`rounded-lg p-2 text-sm ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <span className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Status:
              </span>
              <span className="font-medium">{solved ? "Solved" : "Unsolved"}</span>
            </div>
          </div>
        </div>
      </>
    ) : (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin h-6 w-6 rounded-full border-2 border-t-transparent border-purple-500"></div>
        <span className="ml-2">Loading metadata...</span>
      </div>
    )}
  </div>
</div>
                
                <div className={`rounded-xl p-4 ${
                  isDarkMode ? 'bg-gray-900/70 text-gray-300' : 'bg-gray-50 text-gray-700'
                }`}>
                  <h4 className={`text-lg font-medium mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    <FileText size={18} />
                    Contract Details
                  </h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Network:</span>
                      <span className="font-medium">Base Sepolia</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Contract:</span>
                      <a
                        href={`https://sepolia.basescan.org/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-medium truncate max-w-[200px] ${
                          isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                        }`}
                      >
                        {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Standard:</span>
                      <span className="font-medium">ERC-721</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Token ID:</span>
                      <span className="font-medium">#{mintStatus.tokenId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How to Play - Information Section */}
<div className={`max-w-4xl mx-auto mt-16 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
  <div className="text-center mb-10">
    <h2 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      How to MINT? 
    </h2>
    <p className="max-w-2xl mx-auto text-lg">
      Turn all your NFTs into Interactive Puzzles with our Puzzle Generator. 
    </p>
  </div>

  <div className="grid md:grid-cols-3 gap-8">
    <div className={`p-6 rounded-xl transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700' 
        : 'bg-white/80 hover:bg-white border border-gray-200 hover:shadow-xl'
    }`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
        isDarkMode ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'
      }`}>
        <Search size={24} />
      </div>
      <h3 className={`text-2xl font-bold mx-auto ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        1. Select Your NFT 
      </h3>
      <p className="text-lg">
        Choose any NFT from your collection. Each NFT can be turned into one unique puzzle - choose wisely!
      </p>
    </div>

    <div className={`p-6 rounded-xl transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700' 
        : 'bg-white/80 hover:bg-white border border-gray-200 hover:shadow-xl'
    }`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
        isDarkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
      }`}>
        <Puzzle size={24} />
      </div>
      <h3 className={`text-2xl font-bold mx-auto ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        2. Solve the Puzzle
      </h3>
      <p className="text-lg">
        Once your image is sliced into pieces, they will be shuffled automatically. Drag and drop to arrange the pieces in the correct order.
      </p>
    </div>

    <div className={`p-6 rounded-xl transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700' 
        : 'bg-white/80 hover:bg-white border border-gray-200 hover:shadow-xl'
    }`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
        isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
      }`}>
        <Gift size={24} />
      </div>
      <h3 className={`text-2xl font-bold mx-auto ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        3. Solve & Mint
      </h3>
      <p className="text-lg">
        Try different grid sizes (2x2 to 5x5) and test the puzzle before minting. Solve and mint your own custom puzzle NFTs.
      </p>
    </div>
  </div>

        <div className={`mt-12 p-6 rounded-xl ${
          isDarkMode 
            ? 'bg-gray-800/60 border border-gray-700' 
            : 'bg-white/80 border border-gray-200'
        }`}>
          <div className={`max-w-4xl mx-auto mt-16 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <div className="text-center mb-10">
          <h2 className={`text-3xl font-bold mx-auto ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                question: "What happens when I mint a puzzle as an NFT?",
                answer: "When you mint your NFT as a Puzzle, both the original NFT Image and the puzzle configuration are stored on the blockchain. The NFT metadata includes attributes such as grid size, Original TokenID, Original Collection & Visual Effects.."
              },
              {
                question: "Is there a limit to how many puzzles I can mint?",
                answer: `Yes, there is a limit of ${MAX_PER_WALLET} mints per wallet address. This is to prevent spam and ensure fair distribution.`
              },
              {
                question: "What image formats are supported?",
                answer: "The puzzle generator supports PNG, JPG, and GIF formats. The maximum file size is 5MB."
              },
              {
                question: "Can I sell or trade my puzzle NFTs?",
                answer: "Yes, once minted, your puzzle NFTs can be viewed, sold, or traded on NFT marketplaces that support the Base Sepolia testnet, such as OpenSea."
              },
              {
                question: "Do I need to pay gas fees to mint?",
                answer: "Yes, you'll need some Base Sepolia testnet ETH to cover the gas fees for minting. You can get testnet ETH from the Base Sepolia faucet."
              }
            ].map((faq, index) => (
              <div key={index} className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
              }`}>
                <h4 className={`font-bold mx-auto ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {faq.question}
                </h4>
                <p className="text-base">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          </div>
          </div>  
        </div>
      </div>

      {/* Footer */}
        <footer className="mt-12">
          <p className="text-gray-400 text-center">Puzzle NFT Platform &copy; {new Date().getFullYear()}</p>
        </footer>

      {/* CSS for Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(0) translateX(10px); }
          75% { transform: translateY(10px) translateX(5px); }
        }
        
        @keyframes pulse-effect {
          0% { opacity: 0.7; transform: scale(0.95); }
          50% { opacity: 0.4; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(1.1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        .animate-fadeInScale {
          animation: fadeInScale 0.5s ease-in-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }


        
        .animate-fadeInDown {
          animation: fadeInDown 0.3s ease-out;
        }

        .puzzle-piece {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    will-change: transform;
    transform: translateZ(0);
  }
  
  .puzzle-piece.dragging {
    cursor: grabbing !important;
    z-index: 1000 !important;
  }
  
  .puzzle-container {
    -webkit-user-select: none;
    user-select: none;
    touch-action: none;
    transform-style: preserve-3d;
  }

  #puzzle-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  </section>
);
};

export default PuzzleGenerator;