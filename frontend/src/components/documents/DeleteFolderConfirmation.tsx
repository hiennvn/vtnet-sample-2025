import React from 'react';
import './DeleteFolderConfirmation.css';

interface DeleteFolderConfirmationProps {
  folderName: string;
  isOpen: boolean;
  isNonEmpty?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Component for confirming folder deletion
 */
const DeleteFolderConfirmation: React.FC<DeleteFolderConfirmationProps> = ({
  folderName,
  isOpen,
  isNonEmpty = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Delete Folder</h2>
          <button className="close-button" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          {isNonEmpty ? (
            <>
              <p className="error-message">
                Cannot delete folder <strong>{folderName}</strong>
              </p>
              <p className="warning-message">
                The folder is not empty. Please delete all contents before deleting the folder.
              </p>
            </>
          ) : (
            <>
              <p className="confirm-message">
                Are you sure you want to delete the folder <strong>{folderName}</strong>?
              </p>
              <p className="warning-message">
                This action cannot be undone.
              </p>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>
            {isNonEmpty ? 'OK' : 'Cancel'}
          </button>
          {!isNonEmpty && (
            <button className="btn btn-danger" onClick={onConfirm}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteFolderConfirmation; 