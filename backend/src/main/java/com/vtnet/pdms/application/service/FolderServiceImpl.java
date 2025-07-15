package com.vtnet.pdms.application.service;

import com.vtnet.pdms.domain.exception.ResourceNotFoundException;
import com.vtnet.pdms.domain.model.Folder;
import com.vtnet.pdms.domain.model.Project;
import com.vtnet.pdms.domain.model.User;
import com.vtnet.pdms.domain.repository.FolderRepository;
import com.vtnet.pdms.domain.service.FolderService;
import com.vtnet.pdms.domain.service.ProjectService;
import com.vtnet.pdms.infrastructure.security.SecurityUtils;
import com.vtnet.pdms.infrastructure.storage.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

/**
 * Implementation of the FolderService interface.
 */
@Service
@Transactional
public class FolderServiceImpl implements FolderService {

    private final FolderRepository folderRepository;
    private final ProjectService projectService;
    private final SecurityUtils securityUtils;
    private final StorageService storageService;

    /**
     * Constructor with dependency injection.
     *
     * @param folderRepository Repository for folder operations
     * @param projectService Service for project operations
     * @param securityUtils Security utilities
     * @param storageService Service for file storage operations
     */
    @Autowired
    public FolderServiceImpl(
            FolderRepository folderRepository,
            ProjectService projectService,
            SecurityUtils securityUtils,
            StorageService storageService) {
        this.folderRepository = folderRepository;
        this.projectService = projectService;
        this.securityUtils = securityUtils;
        this.storageService = storageService;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("@customPermissionEvaluator.hasProjectAccess(#projectId)")
    public List<Folder> getProjectFolders(Long projectId) {
        return folderRepository.findByProjectId(projectId);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("@customPermissionEvaluator.hasProjectAccess(#projectId)")
    public List<Folder> getProjectRootFolders(Long projectId) {
        return folderRepository.findByProjectIdAndParentFolderIsNull(projectId);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("@customPermissionEvaluator.hasFolderAccess(#folderId)")
    public List<Folder> getSubfolders(Long folderId) {
        return folderRepository.findByParentFolderId(folderId);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("@customPermissionEvaluator.hasFolderAccess(#id)")
    public Folder getFolderById(Long id) {
        return folderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", id));
    }

    @Override
    @Transactional
    @PreAuthorize("@customPermissionEvaluator.hasProjectAccess(#projectId)")
    public Folder createFolder(Long projectId, Long parentFolderId, String name) {
        Project project = projectService.getProjectById(projectId);
        User currentUser = securityUtils.getCurrentUser();
        
        Folder folder;
        if (parentFolderId == null) {
            // Check if folder with same name exists at root level
            folderRepository.findByProjectIdAndParentFolderIsNullAndName(projectId, name)
                    .ifPresent(existingFolder -> {
                        throw new IllegalArgumentException("Folder with name " + name + " already exists at this location");
                    });
            
            folder = new Folder(project, name, currentUser);
        } else {
            Folder parentFolder = getFolderById(parentFolderId);
            
            // Check if folder with same name exists under this parent
            folderRepository.findByProjectIdAndParentFolderIdAndName(projectId, parentFolderId, name)
                    .ifPresent(existingFolder -> {
                        throw new IllegalArgumentException("Folder with name " + name + " already exists at this location");
                    });
            
            folder = new Folder(project, parentFolder, name, currentUser);
        }
        
        // Save folder to database
        folder = folderRepository.save(folder);
        
        // Create folder in storage system
        try {
            createFolderInStorage(folder);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create folder in storage system", e);
        }
        
        return folder;
    }

    @Override
    @Transactional
    @PreAuthorize("@customPermissionEvaluator.hasFolderAccess(#folderId)")
    public void deleteFolder(Long folderId) {
        Folder folder = getFolderById(folderId);
        
        // Check if folder has documents
        if (!folder.getDocuments().isEmpty()) {
            throw new IllegalStateException("Cannot delete folder that contains documents");
        }
        
        // Check if folder has subfolders
        if (!folder.getSubfolders().isEmpty()) {
            throw new IllegalStateException("Cannot delete folder that contains subfolders");
        }
        
        folderRepository.delete(folder);
    }
    
    /**
     * Creates a folder in the storage system based on the database folder entity.
     * The folder structure follows: uploads/{projectId}/{folderId}
     *
     * @param folder The folder entity
     * @throws IOException If an I/O error occurs
     */
    private void createFolderInStorage(Folder folder) throws IOException {
        // Ensure project directory exists
        String projectPath = "projects/" + folder.getProject().getId();
        storageService.createDirectory(projectPath);
        
        // Create folder directory
        String folderPath = projectPath + "/" + folder.getId();
        storageService.createDirectory(folderPath);
    }
} 