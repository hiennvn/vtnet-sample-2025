import React, { useState } from 'react';
import { useAppDispatch } from '../../redux/store';
import { deleteUser } from '../../redux/slices/userSlice';
import toastService from '../../services/toastService';

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  userName 
}) => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!isOpen) return null;
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      await dispatch(deleteUser(userId)).unwrap();
      toastService.showSuccess(`User ${userName} has been deleted`);
      onClose();
    } catch (error) {
      toastService.showError('Failed to delete user', {
        showRetry: true,
        onRetry: handleDelete
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Delete User</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <p className="confirm-message">
            Are you sure you want to delete user <strong>{userName}</strong>?
          </p>
          <p className="warning-message">
            This action cannot be undone.
          </p>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-outline" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            className="btn btn-danger" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserDialog; 