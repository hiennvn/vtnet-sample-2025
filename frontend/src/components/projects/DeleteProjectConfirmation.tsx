import React from 'react';
import './DeleteProjectConfirmation.css';

interface DeleteProjectConfirmationProps {
  projectName: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteProjectConfirmation({ projectName, isOpen, onConfirm, onCancel }: DeleteProjectConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="delete-project-overlay">
      <div className="delete-project-modal">
        <h2>Delete Project</h2>
        <p>
          Are you sure you want to delete the project <strong>{projectName}</strong>?
        </p>
        <p className="warning-text">
          This action cannot be undone. All project data, including members and documents, will be permanently deleted.
        </p>
        <div className="delete-project-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteProjectConfirmation; 