import React from 'react';
import './DeleteDocumentConfirmation.css';

interface DeleteDocumentConfirmationProps {
  documentName: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Component for confirming document deletion
 */
const DeleteDocumentConfirmation: React.FC<DeleteDocumentConfirmationProps> = ({
  documentName,
  isOpen,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Delete Document</h2>
          <button className="close-button" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <p className="confirm-message">
            Are you sure you want to delete the document <strong>{documentName}</strong>?
          </p>
          <p className="warning-message">
            This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDocumentConfirmation; 