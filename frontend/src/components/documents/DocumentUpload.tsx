import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDocument, resetUploadState } from '../../redux/slices/documentSlice';
import { AppDispatch } from '../../redux/store';
import './DocumentUpload.css';

interface DocumentUploadProps {
  projectId: number;
  folderId?: number;
  onUploadComplete?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ projectId, folderId, onUploadComplete }) => {
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  
  const { uploading, uploadSuccess, error } = useSelector((state: any) => state.documents);

  // Reset state when upload is successful
  React.useEffect(() => {
    if (uploadSuccess) {
      setName('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (onUploadComplete) {
        onUploadComplete();
      }
      
      // Reset upload state after a delay
      setTimeout(() => {
        dispatch(resetUploadState());
      }, 3000);
    }
  }, [uploadSuccess, dispatch, onUploadComplete]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // If no name is set, use the file name
      if (!name) {
        const fileName = selectedFile.name.split('.')[0];
        setName(fileName);
      }
      
      setValidationError('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      
      // If no name is set, use the file name
      if (!name) {
        const fileName = selectedFile.name.split('.')[0];
        setName(fileName);
      }
      
      setValidationError('');
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setValidationError('Document name is required');
      return false;
    }
    
    if (!file) {
      setValidationError('Please select a file to upload');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (file) {
      dispatch(uploadDocument({
        name: name.trim(),
        projectId,
        file,
        folderId
      }));
    }
  };

  return (
    <div className="document-upload">
      <h3>Upload Document</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="document-name">Document Name</label>
          <input
            id="document-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter document name"
            disabled={uploading}
          />
        </div>
        
        <div 
          className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          
          {file ? (
            <div className="selected-file">
              <span className="file-name">{file.name}</span>
              <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
            </div>
          ) : (
            <div className="drop-message">
              <span>Drag & drop a file here or click to browse</span>
            </div>
          )}
        </div>
        
        {validationError && <div className="error-message">{validationError}</div>}
        {error && <div className="error-message">{error}</div>}
        {uploadSuccess && <div className="success-message">Document uploaded successfully!</div>}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="upload-button" 
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUpload; 