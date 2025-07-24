package com.vtnet.pdms.domain.service;

import com.vtnet.pdms.domain.model.Document;
import com.vtnet.pdms.domain.model.DocumentContent;
import com.vtnet.pdms.domain.model.DocumentVersion;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for document content indexing operations.
 */
public interface DocumentIndexingService {

    /**
     * Indexes the content of a document version.
     *
     * @param documentVersion The document version to index
     * @return The created document content
     */
    DocumentContent indexDocumentVersion(DocumentVersion documentVersion);
    
    /**
     * Retrieves indexed content for a document version.
     *
     * @param documentVersionId The document version ID
     * @return Optional document content
     */
    Optional<DocumentContent> getDocumentContent(Long documentVersionId);
    
    /**
     * Retrieves indexed content for a document (latest version).
     *
     * @param documentId The document ID
     * @return Optional document content
     */
    Optional<DocumentContent> getLatestDocumentContent(Long documentId);
    
    /**
     * Retrieves indexed content for a document by name (latest version).
     *
     * @param documentName The document name
     * @param projectId The project ID
     * @return Optional document content
     */
    Optional<DocumentContent> getDocumentContentByName(String documentName, Long projectId);
    
    /**
     * Retrieves all indexed content for a project.
     *
     * @param projectId The project ID
     * @return List of document contents
     */
    List<DocumentContent> getProjectDocumentContents(Long projectId);
    
    /**
     * Handles indexing failure for a document version.
     *
     * @param documentVersion The document version
     * @param errorMessage The error message
     */
    void handleIndexingFailure(DocumentVersion documentVersion, String errorMessage);
    
    /**
     * Reindexes a document version.
     *
     * @param documentVersionId The document version ID
     * @return The updated document content
     */
    DocumentContent reindexDocumentVersion(Long documentVersionId);
    
    /**
     * Reindexes all documents in a project.
     *
     * @param projectId The project ID
     * @return The number of documents reindexed
     */
    int reindexProjectDocuments(Long projectId);
} 