import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Shuffle, RotateCw } from 'lucide-react';

const PuzzleCanvas = ({ 
  imageUrl, 
  initialGridSize = { rows: 3, cols: 3 }, 
  onSolved = () => {}, 
  canvasWidth = 800, 
  canvasHeight = 800,
  interactive = true
}) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const [pieces, setPieces] = useState([]);
  const [solved, setSolved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gridSize, setGridSize] = useState(initialGridSize);

  // Update internal grid size when the prop changes
  useEffect(() => {
    setGridSize(initialGridSize);
  }, [initialGridSize]);

  // Initialize PIXI Application
  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;
    
    const app = new PIXI.Application({
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: 0xf0f0f0,
      resolution: window.devicePixelRatio || 1,
      view: canvasRef.current // Directly use the canvas element
    });
    
    appRef.current = app;
    
    // Load the image and create the puzzle
    loadImageAndCreatePuzzle();
    
    return () => {
      app.destroy(true);
      if (canvasRef.current && canvasRef.current.children[0]) {
        canvasRef.current.removeChild(canvasRef.current.children[0]);
      }
    };
  }, [imageUrl, canvasWidth, canvasHeight]);

  useEffect(() => {
    // Communicate with OpenSea parent
    window.parent.postMessage({
      type: 'PUZZLE_LOADED',
      solved: solved,
      moves: moves
    }, '*');
  
    // Listen for reset commands
    window.addEventListener('message', (e) => {
      if(e.data.type === 'RESET_PUZZLE') {
        shufflePieces();
      }
    });
  }, [solved, moves]);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);
    
    return () => meta.remove();
  }, []);
  
  // Load the image and create the puzzle pieces
  const loadImageAndCreatePuzzle = () => {
    if (!appRef.current || !imageUrl) return;
    
    // Clear existing pieces
    appRef.current.stage.removeChildren();
    
    // Load the image
    const loader = new PIXI.Loader();
    loader.add('puzzleImage', imageUrl);
    loader.load((loader, resources) => {
      const texture = resources.puzzleImage.texture;
      
      // Create puzzle pieces
      createPuzzlePieces(texture);
      
      // Shuffle pieces if interactive
      if (interactive) {
        shufflePieces();
      }
    });
  };
  
  // Create puzzle pieces from the image
  const createPuzzlePieces = (texture) => {
    if (!appRef.current) return;
    
    const { rows, cols } = gridSize;
    const pieceWidth = canvasWidth / cols;
    const pieceHeight = canvasHeight / rows;
    
    const newPieces = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Create a new sprite for each piece
        const piece = new PIXI.Sprite(new PIXI.Texture(
          texture.baseTexture,
          new PIXI.Rectangle(col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight)
        ));
        
        // Set piece properties
        piece.width = pieceWidth;
        piece.height = pieceHeight;
        piece.originalPosition = {
          x: col * pieceWidth,
          y: row * pieceHeight
        };
        piece.position.set(col * pieceWidth, row * pieceHeight);
        piece.interactive = interactive;
        
        // Add drag and drop functionality
        if (interactive) {
          piece.buttonMode = true;
          piece
            .on('pointerdown', onDragStart)
            .on('pointerup', onDragEnd)
            .on('pointerupoutside', onDragEnd)
            .on('pointermove', onDragMove);
        }
        
        // Add to stage and pieces array
        appRef.current.stage.addChild(piece);
        newPieces.push(piece);
      }
    }
    
    setPieces(newPieces);
  };
  
  // Drag and drop handlers
  const onDragStart = function(event) {
    if (!interactive) return;
    
    this.data = event.data;
    this.alpha = 0.8;
    this.dragging = true;
    this.dragStartPosition = this.data.getLocalPosition(this.parent);
    this.startPosition = {
      x: this.position.x,
      y: this.position.y
    };
  };
  
  const onDragEnd = function(event) {
    if (!interactive || !this.dragging) return;
    
    this.alpha = 1;
    this.dragging = false;
    this.data = null;
    
    // Snap to grid
    const { rows, cols } = gridSize;
    const pieceWidth = canvasWidth / cols;
    const pieceHeight = canvasHeight / rows;
    
    const col = Math.round(this.position.x / pieceWidth);
    const row = Math.round(this.position.y / pieceHeight);
    
    // Ensure piece stays within grid
    const newX = Math.max(0, Math.min(cols - 1, col)) * pieceWidth;
    const newY = Math.max(0, Math.min(rows - 1, row)) * pieceHeight;
    
    // Find piece at target position
    const pieceAtTarget = pieces.find(p => 
      p !== this && 
      p.position.x === newX && 
      p.position.y === newY
    );
    
    // Swap pieces
    if (pieceAtTarget) {
      pieceAtTarget.position.x = this.startPosition.x;
      pieceAtTarget.position.y = this.startPosition.y;
    }
    
    this.position.x = newX;
    this.position.y = newY;
    
    // Check if puzzle is solved
    checkIfSolved();
  };
  
  const onDragMove = function() {
    if (!interactive || !this.dragging) return;
    
    const newPosition = this.data.getLocalPosition(this.parent);
    this.position.x = this.startPosition.x + (newPosition.x - this.dragStartPosition.x);
    this.position.y = this.startPosition.y + (newPosition.y - this.dragStartPosition.y);
  };
  
  // Check if puzzle is solved
  const checkIfSolved = () => {
    if (!pieces.length) return;
    
    const isSolved = pieces.every(piece => 
      piece.position.x === piece.originalPosition.x && 
      piece.position.y === piece.originalPosition.y
    );
    
    if (isSolved && !solved) {
      setSolved(true);
      onSolved();
      playCelebrationAnimation();
    } else {
      setSolved(false);
    }
  };
  
  // Shuffle pieces
  const shufflePieces = () => {
    if (!pieces.length || !interactive) return;
    
    // Get all possible positions
    const positions = pieces.map(piece => ({
      x: piece.position.x,
      y: piece.position.y
    }));
    
    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    // Assign new positions to pieces
    pieces.forEach((piece, index) => {
      piece.position.x = positions[index].x;
      piece.position.y = positions[index].y;
    });
    
    setSolved(false);
  };
  
  // Reset puzzle
  const resetPuzzle = () => {
    if (!pieces.length) return;
    
    pieces.forEach(piece => {
      piece.position.x = piece.originalPosition.x;
      piece.position.y = piece.originalPosition.y;
    });
    
    setSolved(true);
  };
  
  // Change grid size
  const changeGridSize = (newRows, newCols) => {
    const newGridSize = { rows: newRows, cols: newCols };
    
    // Check if grid size is actually changing
    if (newGridSize.rows === gridSize.rows && newGridSize.cols === gridSize.cols) return;
    
    setGridSize(newGridSize);
  };

  // Watch for grid size changes and reload the puzzle
  useEffect(() => {
    if (appRef.current && imageUrl) {
      loadImageAndCreatePuzzle();
    }
  }, [gridSize, imageUrl]);
  
  // Play celebration animation
  const playCelebrationAnimation = () => {
    // You can add confetti or other celebration effects here
    console.log('Puzzle solved! Celebration animation played.');
  };
  
  // Grid configuration options
  const gridOptions = [
    { label: "1x1", rows: 1, cols: 1 },
    { label: "2x2", rows: 2, cols: 2 },
    { label: "3x3", rows: 3, cols: 3 },
    { label: "4x4", rows: 4, cols: 4 },
    { label: "5x5", rows: 5, cols: 5 },
    { label: "1x4", rows: 1, cols: 4 },
    { label: "1x5", rows: 1, cols: 5 },
    { label: "4x1", rows: 4, cols: 1 },
    { label: "5x1", rows: 5, cols: 1 },
    { label: "2x3", rows: 2, cols: 3 },
  ];
  
  return (
    <div className="puzzle-container">
      <div ref={canvasRef} className="puzzle-canvas"></div>
      
      {interactive && (
        <div className="puzzle-controls">
          <button onClick={() => setShowSettings(!showSettings)} className="settings-button">
            ⋮
          </button>
          
          {showSettings && (
            <div className="settings-menu">
              <button onClick={shufflePieces}>Shuffle</button>
              <button onClick={resetPuzzle}>Reset</button>
              <div className="grid-selector">
                <span>Grid Size:</span>
                <select 
                  onChange={(e) => {
                    const [rows, cols] = e.target.value.split('x').map(Number);
                    changeGridSize(rows, cols);
                  }}
                  value={`${gridSize.rows}x${gridSize.cols}`}
                >
                  {gridOptions.map(option => (
                    <option key={option.label} value={`${option.rows}x${option.cols}`}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .puzzle-container {
          position: relative;
          width: ${canvasWidth}px;
          height: ${canvasHeight}px;
        }
        
        .puzzle-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 100;
        }
        
        .settings-button {
          background: rgba(255, 255, 255, 0.8);
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          font-size: 18px;
          cursor: pointer;
        }
        
        .settings-menu {
          position: absolute;
          top: 40px;
          right: 0;
          background: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          border-radius: 5px;
          padding: 10px;
          width: 150px;
        }
        
        .settings-menu button {
          display: block;
          width: 100%;
          padding: 5px;
          margin-bottom: 5px;
          border: none;
          background: #f0f0f0;
          cursor: pointer;
        }
        
        .settings-menu button:hover {
          background: #e0e0e0;
        }
        
        .grid-selector {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
        }
        .canvas-controls {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 1000;
          background: rgba(0,0,0,0.7);
          padding: 8px 16px;
          border-radius: 24px;
        }
        .control-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .control-btn:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};

export default PuzzleCanvas;