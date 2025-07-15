package com.vtnet.pdms.domain.service;

import com.vtnet.pdms.domain.model.Document;

import java.util.List;

/**
 * Service interface for document operations.
 */
public interface DocumentService {

    /**
     * Get a document by ID.
     *
     * @param id The document ID
     * @return The document
     * @throws com.vtnet.pdms.domain.exception.ResourceNotFoundException if the document is not found
     */
    Document getDocumentById(Long id);

    /**
     * Get all documents for a project.
     *
     * @param projectId The project ID
     * @return List of documents
     */
    List<Document> getProjectDocuments(Long projectId);

    /**
     * Get documents for a folder.
     *
     * @param folderId The folder ID
     * @return List of documents
     */
    List<Document> getFolderDocuments(Long folderId);

    /**
     * Search documents by name within a project.
     *
     * @param projectId The project ID
     * @param query The search query
     * @return List of matching documents
     */
    List<Document> searchDocumentsByName(Long projectId, String query);

    /**
     * Update document display order within a folder.
     *
     * @param folderId The folder ID
     * @param documentIds Ordered list of document IDs
     */
    void updateDocumentOrder(Long folderId, List<Long> documentIds);

    /**
     * Delete a document.
     *
     * @param documentId The document ID
     */
    void deleteDocument(Long documentId);
} 