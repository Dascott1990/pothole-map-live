import React, { useState } from 'react';
import { api } from '../utils/api';
import { validateImage } from '../utils/helpers';

const ImageUpload = ({ onDetectionComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError('');
    setPreview(URL.createObjectURL(file));
    setResults(null);
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    
    if (!file) {
      setError('Please select an image first');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/api/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResults(response.data);
      if (onDetectionComplete) {
        onDetectionComplete(response.data);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const validation = validateImage(file);
      if (validation.valid) {
        setError('');
        setPreview(URL.createObjectURL(file));
        setResults(null);
        // Set file to input
        const fileInput = document.getElementById('imageUpload');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
      } else {
        setError(validation.error);
      }
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">AI Pothole Detection</h5>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div 
          className="border border-dashed rounded p-4 text-center mb-3"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{ 
            borderStyle: 'dashed', 
            backgroundColor: preview ? 'transparent' : '#f8f9fa',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('imageUpload').click()}
        >
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleFileSelect}
            className="d-none"
          />
          
          {preview ? (
            <div>
              <img 
                src={preview} 
                alt="Preview" 
                className="img-fluid rounded mb-2"
                style={{ maxHeight: '200px' }}
              />
              <p className="text-muted">Click or drag to change image</p>
            </div>
          ) : (
            <div>
              <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
              <p className="text-muted">Click or drag & drop to upload image</p>
              <small className="text-muted">JPEG, PNG, WebP, GIF (max 16MB)</small>
            </div>
          )}
        </div>

        <button 
          className="btn btn-primary w-100 mb-3"
          onClick={handleUpload}
          disabled={uploading || !preview}
        >
          {uploading ? 'Analyzing...' : 'Analyze with AI'}
        </button>

        {results && (
          <div className="mt-3">
            <h6>Detection Results:</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <img 
                    src={results.url} 
                    alt="Original" 
                    className="card-img-top"
                  />
                  <div className="card-body">
                    <p className="card-text text-center">Original</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <img 
                    src={results.annotated_url || results.url} 
                    alt="Analyzed" 
                    className="card-img-top"
                  />
                  <div className="card-body">
                    <p className="card-text text-center">AI Analysis</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-light rounded">
              <p><strong>Detections:</strong> {results.detection_count}</p>
              <p><strong>Average Confidence:</strong> {(results.avg_conf * 100).toFixed(1)}%</p>
              <p><strong>Detected Objects:</strong></p>
              <ul className="list-unstyled">
                {results.detections?.map((det, index) => (
                  <li key={index} className="text-muted">
                    {det.class}: {(det.conf * 100).toFixed(1)}% confidence
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;