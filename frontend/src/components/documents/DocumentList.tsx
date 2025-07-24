import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/store';
import { DocumentDTO } from '../../types/document';
import { formatDate } from '../../utils/dateUtils';
import { deleteDocument } from '../../redux/slices/documentSlice';
import DeleteDocumentConfirmation from './DeleteDocumentConfirmation';
import toastService from '../../services/toastService';
import './DocumentList.css';

interface DocumentListProps {
  onDocumentSelect: (document: DocumentDTO) => void;
  selectedDocumentId?: number | null;
  isProjectManager?: boolean;
}

/**
 * Component for displaying a list of documents
 */
const DocumentList: React.FC<DocumentListProps> = ({ 
  onDocumentSelect, 
  selectedDocumentId,
  isProjectManager = false
}) => {
  const dispatch = useAppDispatch();
  const { documents, loading, error } = useAppSelector((state) => state.documents);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentDTO | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Get file icon based on file type
  const getFileIcon = (fileType: string): string => {
    if (!fileType) return '📎';
    
    const type = fileType.toLowerCase();
    if (type.includes('image') || type.endsWith('png') || type.endsWith('jpg') || type.endsWith('jpeg') || type.endsWith('gif')) {
      return '🖼️';
    } else if (type.endsWith('pdf')) {
      return '📄';
    } else if (type.includes('excel') || type.endsWith('xlsx') || type.endsWith('xls') || type.endsWith('csv')) {
      return '📊';
    } else if (type.includes('powerpoint') || type.endsWith('ppt') || type.endsWith('pptx')) {
      return '📑';
    } else if (type.includes('word') || type.endsWith('doc') || type.endsWith('docx')) {
      return '📝';
    } else if (type.includes('text') || type.endsWith('txt')) {
      return '📃';
    } else {
      return '📎';
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
  };

  // Handle document selection
  const handleDocumentSelect = (document: DocumentDTO) => {
    onDocumentSelect(document);
  };

  // Handle document delete click
  const handleDeleteClick = (e: React.MouseEvent, document: DocumentDTO) => {
    e.stopPropagation(); // Prevent document selection
    setDocumentToDelete(document);
    setIsDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (documentToDelete) {
      try {
        await dispatch(deleteDocument(documentToDelete.id)).unwrap();
        toastService.showSuccess(`Document "${documentToDelete.name}" deleted successfully`);
      } catch (error) {
        toastService.showError('Failed to delete document');
      } finally {
        setIsDeleteModalOpen(false);
        setDocumentToDelete(null);
      }
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDocumentToDelete(null);
  };

  if (loading && documents.length === 0) {
    return <div className="document-list-loading">Loading documents...</div>;
  }

  if (error) {
    return <div className="document-list-error">Error: {error}</div>;
  }

  if (documents.length === 0) {
    return <div className="document-list-empty">No documents found in this folder.</div>;
  }

  return (
    <>
      <div className="document-list">
        <div className="document-list-header">
          <div className="document-list-header-name">Name</div>
          <div className="document-list-header-size">Size</div>
          <div className="document-list-header-created">Created</div>
          <div className="document-list-header-by">Created By</div>
          {isProjectManager && <div className="document-list-header-actions">Actions</div>}
        </div>
        <div className="document-list-content">
          {documents.map((document) => (
            <div
              key={document.id}
              className={`document-list-item ${selectedDocumentId === document.id ? 'selected' : ''}`}
              onClick={() => handleDocumentSelect(document)}
            >
              <div className="document-list-item-name">
                <span className="document-icon">{getFileIcon(document.fileType)}</span>
                <span className="document-name">{document.name || 'Unnamed document'}</span>
              </div>
              <div className="document-list-item-size">{document.size ? formatFileSize(document.size) : 'Unknown'}</div>
              <div className="document-list-item-created">{document.createdAt ? formatDate(document.createdAt) : 'Unknown'}</div>
              <div className="document-list-item-by">
                {typeof document.createdBy === 'object' && document.createdBy !== null
                  ? (document.createdBy as any).name || 'Unknown'
                  : document.createdBy || 'Unknown'}
              </div>
              {isProjectManager && (
                <div className="document-list-item-actions">
                  <button 
                    className="btn-icon btn-danger"
                    onClick={(e) => handleDeleteClick(e, document)}
                    title="Delete document"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {documentToDelete && (
        <DeleteDocumentConfirmation
          documentName={documentToDelete.name}
          isOpen={isDeleteModalOpen}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </>
  );
};

export default DocumentList; 