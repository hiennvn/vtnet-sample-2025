package com.vtnet.pdms.infrastructure.document;

import com.vtnet.pdms.domain.model.DocumentVersion;
import com.vtnet.pdms.domain.service.DocumentProcessor;
import com.vtnet.pdms.infrastructure.storage.StorageService;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

/**
 * Implementation of DocumentProcessor for DOCX documents.
 */
@Component
public class DocxDocumentProcessor implements DocumentProcessor {

    private static final Logger logger = LoggerFactory.getLogger(DocxDocumentProcessor.class);
    private static final String[] SUPPORTED_MIME_TYPES = {
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
    
    private final StorageService storageService;
    
    /**
     * Constructor with dependency injection.
     *
     * @param storageService Service for file storage operations
     */
    @Autowired
    public DocxDocumentProcessor(StorageService storageService) {
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
        
        logger.info("Extracting content from DOCX document: {}", documentVersion.getStoragePath());
        
        Resource resource = storageService.loadAsResource(documentVersion.getStoragePath());
        
        try (InputStream inputStream = resource.getInputStream();
             XWPFDocument document = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            
            String text = extractor.getText();
            
            logger.debug("Extracted {} characters from DOCX document", text.length());
            
            return text;
        } catch (IOException e) {
            logger.error("Failed to extract content from DOCX document: {}", documentVersion.getStoragePath(), e);
            throw e;
        }
    }
} 