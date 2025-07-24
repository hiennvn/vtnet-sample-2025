package com.vtnet.pdms.domain.service;

import com.vtnet.pdms.domain.model.DocumentVersion;

import java.io.IOException;

/**
 * Interface for document content extraction.
 */
public interface DocumentProcessor {

    /**
     * Checks if this processor can handle the given document type.
     *
     * @param mimeType The MIME type of the document
     * @return true if this processor can handle the document type, false otherwise
     */
    boolean canProcess(String mimeType);

    /**
     * Extracts text content from a document.
     *
     * @param documentVersion The document version to process
     * @return The extracted text content
     * @throws IOException If an I/O error occurs
     */
    String extractContent(DocumentVersion documentVersion) throws IOException;
} 