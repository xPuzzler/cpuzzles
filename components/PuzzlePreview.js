// components/PuzzlePreview.js
import React from 'react';
import PuzzleCanvas from './PuzzleCanvas';

const PuzzlePreview = ({ imageUrl, gridSize, onGridChange }) => {
  return (
    <div className="puzzle-preview">
      <div className="preview-controls">
        <label>Grid Size Preview:</label>
        <select
          value={gridSize}
          onChange={(e) => onGridChange(parseInt(e.target.value))}
        >
          {[2, 3, 4, 5].map(size => (
            <option key={size} value={size}>{size}x{size}</option>
          ))}
        </select>
      </div>
      
      <PuzzleCanvas 
        imageUrl={imageUrl}
        initialGridSize={{ rows: gridSize, cols: gridSize }}
        canvasWidth={400}
        canvasHeight={400}
        interactive={true}
      />
    </div>
  );
};

export default PuzzlePreview;