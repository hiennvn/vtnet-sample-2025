package com.vtnet.pdms.application.service;

import com.vtnet.pdms.application.dto.DocumentUploadDTO;
import com.vtnet.pdms.domain.exception.ResourceNotFoundException;
import com.vtnet.pdms.domain.model.Document;
import com.vtnet.pdms.domain.model.DocumentVersion;
import com.vtnet.pdms.domain.model.Folder;
import com.vtnet.pdms.domain.model.User;
import com.vtnet.pdms.domain.repository.DocumentRepository;
import com.vtnet.pdms.domain.service.DocumentService;
import com.vtnet.pdms.domain.service.FolderService;
import com.vtnet.pdms.domain.service.ProjectService;
import com.vtnet.pdms.infrastructure.security.SecurityUtils;
import com.vtnet.pdms.infrastructure.storage.StorageService;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

/**
 * Implementation of the DocumentService interface.
 */
@Service
@Transactional
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final FolderService folderService;
    private final ProjectService projectService;
    private final StorageService storageService;
    private final SecurityUtils securityUtils;
    private final Tika tika;

    /**
     * Constructor with dependency injection.
     *
     * @param documentRepository Repository for document operations
     * @param folderService Service for folder operations
     * @param projectService Service for project operations
     * @param storageService Service for file storage operations
     * @param securityUtils Security utilities
     */
    @Autowired
    public DocumentServiceImpl(
            DocumentRepository documentRepository,
            FolderService folderService,
            ProjectService projectService,
            StorageService storageService,
            SecurityUtils securityUtils) {
        this.documentRepository = documentRepository;
        this.folderService = folderService;
        this.projectService = projectService;
        this.storageService = storageService;
        this.securityUtils = securityUtils;
        this.tika = new Tika();
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
        return documentRepository.findByFolderId(folderId);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("@customPermissionEvaluator.hasDocumentAccess(#id)")
    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ROLE_PROJECT_MANAGER') and @customPermissionEvaluator.hasProjectAccess(#uploadDTO.projectId)")
    public Document uploadDocument(DocumentUploadDTO uploadDTO) throws IOException {
        validateDocumentUpload(uploadDTO);
        
        // Get the current user
        User currentUser = securityUtils.getCurrentUser();
        
        // Get the folder (or use project root if folderId is null)
        Folder folder;
        if (uploadDTO.getFolderId() != null) {
            folder = folderService.getFolderById(uploadDTO.getFolderId());
        } else {
            // Create a root-level document (no folder)
            throw new IllegalArgumentException("Documents must be uploaded to a folder");
        }
        
        // Check if the folder belongs to the specified project
        if (!folder.getProject().getId().equals(uploadDTO.getProjectId())) {
            throw new IllegalArgumentException("Folder does not belong to the specified project");
        }
        
        // Detect MIME type
        MultipartFile file = uploadDTO.getFile();
        String mimeType = tika.detect(file.getInputStream());
        
        // Create the document
        Document document = new Document(
                folder,
                uploadDTO.getName(),
                mimeType,
                file.getSize(),
                currentUser
        );
        
        // Save the document to get an ID
        document = documentRepository.save(document);
        
        // Store the file
        Path storedFilePath = storageService.store(file, document.getId() + "_" + file.getOriginalFilename());
        String storagePath = storedFilePath.getFileName().toString();
        
        // Add the first version
        document.addVersion(storagePath, file.getSize(), currentUser);
        
        // Save the document again with the version
        return documentRepository.save(document);
    }

    @Override
    public void validateDocumentUpload(DocumentUploadDTO uploadDTO) {
        if (uploadDTO == null) {
            throw new IllegalArgumentException("Upload data cannot be null");
        }
        
        if (uploadDTO.getFile() == null || uploadDTO.getFile().isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        if (uploadDTO.getName() == null || uploadDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Document name cannot be empty");
        }
        
        if (uploadDTO.getProjectId() == null) {
            throw new IllegalArgumentException("Project ID cannot be null");
        }
        
        // Check if project exists
        projectService.getProjectById(uploadDTO.getProjectId());
        
        // Check if folder exists (if provided)
        if (uploadDTO.getFolderId() != null) {
            folderService.getFolderById(uploadDTO.getFolderId());
        }
    }
} 