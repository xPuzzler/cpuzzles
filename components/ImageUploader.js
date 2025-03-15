import React, { useState } from 'react';

const ImageUploader = ({ onImageUpload }) => {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Check if file is an image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        onImageUpload(e.target.result, file);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file.');
    }
  };

  return (
    <div className="image-uploader">
      {!preview ? (
        <div 
          className={`upload-area ${dragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <p>Drag and drop an image here, or</p>
          <div className="file-input-container">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              id="file-input"
              className="file-input"
            />
            <label htmlFor="file-input" className="browse-button">
              Browse
            </label>
          </div>
        </div>
      ) : (
        <div className="preview-container">
          <img src={preview} alt="Preview" className="image-preview" />
          <button 
            onClick={() => {
              setPreview(null);
              onImageUpload(null, null);
            }}
            className="remove-button"
          >
            Remove
          </button>
        </div>
      )}
      
      <style jsx>{`
        .image-uploader {
          width: 100%;
          margin-bottom: 1rem;
        }
        .upload-area {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .upload-area.dragging {
          border-color: #6366f1;
          background-color: rgba(99, 102, 241, 0.1);
        }
        .file-input {
          display: none;
        }
        .browse-button {
          display: inline-block;
          padding: 0.5rem 1rem;
          background-color: #6366f1;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 1rem;
        }
        .preview-container {
          position: relative;
        }
        .image-preview {
          width: 100%;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .remove-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ImageUploader;