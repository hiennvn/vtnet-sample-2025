package com.vtnet.pdms.infrastructure.document;

import com.vtnet.pdms.domain.model.DocumentVersion;
import com.vtnet.pdms.domain.service.DocumentProcessor;
import com.vtnet.pdms.infrastructure.storage.StorageService;
import org.apache.commons.io.IOUtils;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

/**
 * Implementation of DocumentProcessor for PDF documents.
 */
@Component
public class PdfDocumentProcessor implements DocumentProcessor {

    private static final Logger logger = LoggerFactory.getLogger(PdfDocumentProcessor.class);
    private static final String[] SUPPORTED_MIME_TYPES = {
            "application/pdf"
    };
    
    private final StorageService storageService;
    
    /**
     * Constructor with dependency injection.
     *
     * @param storageService Service for file storage operations
     */
    @Autowired
    public PdfDocumentProcessor(StorageService storageService) {
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
        
        logger.info("Extracting content from PDF document: {}", documentVersion.getStoragePath());
        
        Resource resource = storageService.loadAsResource(documentVersion.getStoragePath());
        
        try (InputStream inputStream = resource.getInputStream()) {
            // Convert InputStream to byte array for PDFBox 3.0.1
            byte[] pdfBytes = IOUtils.toByteArray(inputStream);
            
            try (PDDocument document = Loader.loadPDF(pdfBytes)) {
                PDFTextStripper textStripper = new PDFTextStripper();
                String text = textStripper.getText(document);
                
                logger.debug("Extracted {} characters from PDF document", text.length());
                
                return text;
            }
        } catch (IOException e) {
            logger.error("Failed to extract content from PDF document: {}", documentVersion.getStoragePath(), e);
            throw e;
        }
    }
} 