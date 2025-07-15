import React from 'react';
import { useAppSelector } from '../../redux/store';
import { DocumentDTO } from '../../types/document';
import { formatDate } from '../../utils/dateUtils';
import './DocumentList.css';

interface DocumentListProps {
  onDocumentSelect: (document: DocumentDTO) => void;
  selectedDocumentId?: number | null;
}

/**
 * Component for displaying a list of documents
 */
const DocumentList: React.FC<DocumentListProps> = ({ onDocumentSelect, selectedDocumentId }) => {
  const { documents, loading, error } = useAppSelector((state) => state.documents);

  // Get file icon based on MIME type
  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType === 'application/pdf') {
      return '📄';
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return '📊';
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return '📑';
    } else if (mimeType.includes('document') || mimeType.includes('word')) {
      return '📝';
    } else if (mimeType.includes('text/')) {
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
    <div className="document-list">
      <div className="document-list-header">
        <div className="document-list-header-name">Name</div>
        <div className="document-list-header-size">Size</div>
        <div className="document-list-header-created">Created</div>
        <div className="document-list-header-by">Created By</div>
      </div>
      <div className="document-list-content">
        {documents.map((document) => (
          <div
            key={document.id}
            className={`document-list-item ${selectedDocumentId === document.id ? 'selected' : ''}`}
            onClick={() => handleDocumentSelect(document)}
          >
            <div className="document-list-item-name">
              <span className="document-icon">{getFileIcon(document.mimeType)}</span>
              <span className="document-name">{document.name}</span>
              {document.versionCount > 1 && (
                <span className="document-version">v{document.latestVersionNumber}</span>
              )}
            </div>
            <div className="document-list-item-size">{formatFileSize(document.size)}</div>
            <div className="document-list-item-created">{formatDate(document.createdAt)}</div>
            <div className="document-list-item-by">{document.createdBy.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList; 