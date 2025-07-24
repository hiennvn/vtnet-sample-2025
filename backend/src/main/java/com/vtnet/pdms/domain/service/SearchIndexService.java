package com.vtnet.pdms.domain.service;

import com.vtnet.pdms.domain.model.DocumentContent;

import java.util.List;
import java.util.Map;

/**
 * Service interface for search index operations.
 */
public interface SearchIndexService {

    /**
     * Adds a document to the search index.
     *
     * @param documentContent The document content to add
     * @return true if the document was added successfully, false otherwise
     */
    boolean addToIndex(DocumentContent documentContent);
    
    /**
     * Searches the index for documents matching the query.
     *
     * @param query The search query
     * @param projectId The project ID (optional, can be null to search across all projects)
     * @param maxResults The maximum number of results to return
     * @return List of document IDs with their relevance scores
     */
    List<Map<String, Object>> search(String query, Long projectId, int maxResults);
    
    /**
     * Removes a document from the search index.
     *
     * @param documentId The document ID
     * @return true if the document was removed successfully, false otherwise
     */
    boolean removeFromIndex(Long documentId);
    
    /**
     * Removes all documents for a project from the search index.
     *
     * @param projectId The project ID
     * @return The number of documents removed
     */
    int removeProjectFromIndex(Long projectId);
    
    /**
     * Gets the status of the search index.
     *
     * @return Map containing index status information
     */
    Map<String, Object> getIndexStatus();
} 