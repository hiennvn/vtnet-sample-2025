import React, { useState } from 'react';
import { useAppDispatch } from '../../redux/store';
import { createFolder } from '../../redux/slices/folderSlice';
import './CreateFolderDialog.css';

interface CreateFolderDialogProps {
  projectId: number;
  parentFolderId?: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Component for creating a new folder
 */
const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  projectId,
  parentFolderId,
  onClose,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(e.target.value);
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await dispatch(createFolder({
        name: folderName.trim(),
        projectId,
        parentFolderId: parentFolderId || undefined
      })).unwrap();
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create folder');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-folder-dialog-overlay">
      <div className="create-folder-dialog">
        <div className="create-folder-dialog-header">
          <h3>Create New Folder</h3>
          <button 
            className="create-folder-dialog-close" 
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="create-folder-form">
          <div className="form-group">
            <label htmlFor="folderName">Folder Name</label>
            <input
              id="folderName"
              type="text"
              value={folderName}
              onChange={handleNameChange}
              placeholder="Enter folder name"
              autoFocus
              maxLength={255}
              disabled={isSubmitting}
            />
            {error && <div className="form-error">{error}</div>}
          </div>
          
          <div className="create-folder-dialog-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderDialog; 