package com.vtnet.pdms.application.service;

import com.vtnet.pdms.domain.exception.ResourceNotFoundException;
import com.vtnet.pdms.domain.model.Document;
import com.vtnet.pdms.domain.model.Folder;
import com.vtnet.pdms.domain.repository.DocumentRepository;
import com.vtnet.pdms.domain.service.DocumentService;
import com.vtnet.pdms.domain.service.FolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

/**
 * Implementation of the DocumentService interface.
 */
@Service
@Transactional
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final FolderService folderService;

    /**
     * Constructor with dependency injection.
     *
     * @param documentRepository Repository for document operations
     * @param folderService Service for folder operations
     */
    @Autowired
    public DocumentServiceImpl(
            DocumentRepository documentRepository,
            FolderService folderService) {
        this.documentRepository = documentRepository;
        this.folderService = folderService;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("@customPermissionEvaluator.hasDocumentAccess(#id)")
    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("@customPermissionEvaluator.hasProjectAccess(#projectId)")
    public List<Document> getProjectDocuments(Long projectId) {
        return documentRepository.findByProjectId(projectId);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("@customPermissionEvaluator.hasFolderAccess(#folderId)")
    public List<Document> getFolderDocuments(Long folderId) {
        // Get folder to verify access
        folderService.getFolderById(folderId);
        return documentRepository.findByFolderIdOrderByDisplayOrderAsc(folderId);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("@customPermissionEvaluator.hasProjectAccess(#projectId)")
    public List<Document> searchDocumentsByName(Long projectId, String query) {
        return documentRepository.findByProjectIdAndNameContainingIgnoreCase(projectId, query);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ROLE_PROJECT_MANAGER') and @customPermissionEvaluator.hasFolderAccess(#folderId)")
    public void updateDocumentOrder(Long folderId, List<Long> documentIds) {
        // Get folder to verify access
        Folder folder = folderService.getFolderById(folderId);
        
        // Verify all documents belong to the folder
        List<Document> documents = documentRepository.findByFolderId(folderId);
        Map<Long, Document> documentMap = new HashMap<>();
        for (Document document : documents) {
            documentMap.put(document.getId(), document);
        }
        
        for (Long documentId : documentIds) {
            if (!documentMap.containsKey(documentId)) {
                throw new IllegalArgumentException("Document with ID " + documentId + " does not belong to folder " + folderId);
            }
        }
        
        // Update display order
        IntStream.range(0, documentIds.size()).forEach(i -> {
            Document document = documentMap.get(documentIds.get(i));
            document.setDisplayOrder(i);
            documentRepository.save(document);
        });
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ROLE_PROJECT_MANAGER') and @customPermissionEvaluator.hasDocumentAccess(#documentId)")
    public void deleteDocument(Long documentId) {
        Document document = getDocumentById(documentId);
        documentRepository.delete(document);
    }
} 