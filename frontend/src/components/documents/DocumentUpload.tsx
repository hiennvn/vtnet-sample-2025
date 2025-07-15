import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDocument, resetUploadState } from '../../redux/slices/documentSlice';
import { AppDispatch, RootState } from '../../redux/store';
import './DocumentUpload.css';

interface DocumentUploadProps {
  projectId: number;
  folderId?: number;
  onUploadComplete?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ projectId, folderId, onUploadComplete }) => {
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { uploading, uploadSuccess, error } = useSelector((state: RootState) => state.documents);

  // Reset upload state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetUploadState());
    };
  }, [dispatch]);

  // Handle successful upload
  useEffect(() => {
    if (uploadSuccess) {
      // Reset form
      setFileName('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete();
      }
      
      // Reset upload state after a delay
      setTimeout(() => {
        dispatch(resetUploadState());
      }, 3000);
    }
  }, [uploadSuccess, dispatch, onUploadComplete]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setValidationError(null);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
    setValidationError(null);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setValidationError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!fileName.trim()) {
      setValidationError('Document name is required');
      return;
    }
    
    if (!file) {
      setValidationError('Please select a file to upload');
      return;
    }
    
    // Dispatch upload action
    dispatch(uploadDocument({
      name: fileName,
      projectId,
      file,
      folderId
    }));
  };

  return (
    <div className="document-upload">
      <h3>Upload Document</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="documentName">Document Name</label>
          <input
            type="text"
            id="documentName"
            value={fileName}
            onChange={handleNameChange}
            placeholder="Enter document name"
            disabled={uploading}
            required
          />
        </div>
        
        <div 
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="file-input"
            disabled={uploading}
          />
          <div className="drop-zone-content">
            {file ? (
              <div className="selected-file">
                <span className="file-name">{file.name}</span>
                <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            ) : (
              <>
                <p>Drag & drop file here or</p>
                <button 
                  type="button" 
                  className="browse-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  Browse Files
                </button>
              </>
            )}
          </div>
        </div>
        
        {validationError && <div className="error-message">{validationError}</div>}
        {error && <div className="error-message">{error}</div>}
        {uploadSuccess && <div className="success-message">Document uploaded successfully!</div>}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="upload-button"
            disabled={uploading || !file}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUpload; 