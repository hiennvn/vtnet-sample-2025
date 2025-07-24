package com.vtnet.pdms.infrastructure.document;

import com.vtnet.pdms.domain.model.DocumentVersion;
import com.vtnet.pdms.domain.service.DocumentProcessor;
import com.vtnet.pdms.infrastructure.storage.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/**
 * Implementation of DocumentProcessor for plain text documents.
 */
@Component
public class TxtDocumentProcessor implements DocumentProcessor {

    private static final Logger logger = LoggerFactory.getLogger(TxtDocumentProcessor.class);
    private static final String[] SUPPORTED_MIME_TYPES = {
            "text/plain",
            "text/csv",
            "text/html",
            "text/xml",
            "application/json"
    };
    
    private final StorageService storageService;
    
    /**
     * Constructor with dependency injection.
     *
     * @param storageService Service for file storage operations
     */
    @Autowired
    public TxtDocumentProcessor(StorageService storageService) {
        this.storageService = storageService;
    }

    @Override
    public boolean canProcess(String mimeType) {
        if (mimeType == null) {
            return false;
        }
        
        for (String supportedType : SUPPORTED_MIME_TYPES) {
            if (supportedType.equalsIgnoreCase(mimeType)) {
                return true;
            }
        }
        
        return false;
    }

    @Override
    public String extractContent(DocumentVersion documentVersion) throws IOException {
        if (documentVersion == null || documentVersion.getStoragePath() == null) {
            throw new IllegalArgumentException("Document version or storage path is null");
        }
        
        logger.info("Extracting content from text document: {}", documentVersion.getStoragePath());
        
        Resource resource = storageService.loadAsResource(documentVersion.getStoragePath());
        
        try (InputStream inputStream = resource.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            
            String text = reader.lines().collect(Collectors.joining("\n"));
            
            logger.debug("Extracted {} characters from text document", text.length());
            
            return text;
        } catch (IOException e) {
            logger.error("Failed to extract content from text document: {}", documentVersion.getStoragePath(), e);
            throw e;
        }
    }
} 