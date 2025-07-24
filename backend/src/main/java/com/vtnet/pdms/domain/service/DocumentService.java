package com.vtnet.pdms.domain.service;

import com.vtnet.pdms.application.dto.DocumentUploadDTO;
import com.vtnet.pdms.domain.model.Document;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Service interface for document operations.
 */
public interface DocumentService {

    /**
     * Get documents for a project.
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
     * Get a document by ID.
     *
     * @param id The document ID
     * @return The document
     */
    Document getDocumentById(Long id);

    /**
     * Upload a new document.
     *
     * @param uploadDTO The document upload data
     * @return The created document
     * @throws IOException If an I/O error occurs
     */
    Document uploadDocument(DocumentUploadDTO uploadDTO) throws IOException;

    /**
     * Validate document upload data.
     *
     * @param uploadDTO The document upload data
     * @throws IllegalArgumentException If the data is invalid
     */
    void validateDocumentUpload(DocumentUploadDTO uploadDTO);
    
    /**
     * Delete a document.
     *
     * @param id The document ID
     */
    void deleteDocument(Long id);
} 