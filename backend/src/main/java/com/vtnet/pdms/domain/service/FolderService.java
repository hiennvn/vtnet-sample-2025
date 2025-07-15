package com.vtnet.pdms.domain.service;

import com.vtnet.pdms.domain.model.Folder;

import java.util.List;

/**
 * Service interface for folder operations.
 */
public interface FolderService {

    /**
     * Get a folder by ID.
     *
     * @param id The folder ID
     * @return The folder
     * @throws com.vtnet.pdms.domain.exception.ResourceNotFoundException if the folder is not found
     */
    Folder getFolderById(Long id);

    /**
     * Get all folders for a project.
     *
     * @param projectId The project ID
     * @return List of folders
     */
    List<Folder> getProjectFolders(Long projectId);

    /**
     * Get root folders for a project (folders with no parent).
     *
     * @param projectId The project ID
     * @return List of root folders
     */
    List<Folder> getProjectRootFolders(Long projectId);

    /**
     * Get subfolders for a folder.
     *
     * @param folderId The parent folder ID
     * @return List of subfolders
     */
    List<Folder> getSubfolders(Long folderId);

    /**
     * Create a new folder.
     *
     * @param projectId The project ID
     * @param parentFolderId The parent folder ID (can be null for root folders)
     * @param name The folder name
     * @return The created folder
     */
    Folder createFolder(Long projectId, Long parentFolderId, String name);

    /**
     * Delete a folder.
     *
     * @param folderId The folder ID
     * @throws IllegalStateException if the folder is not empty
     */
    void deleteFolder(Long folderId);
} 