package com.vtnet.pdms.domain.repository;

import com.vtnet.pdms.domain.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Folder entity.
 */
@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {

    /**
     * Find folders by project ID.
     *
     * @param projectId The project ID
     * @return List of folders
     */
    List<Folder> findByProjectId(Long projectId);

    /**
     * Find folders by project ID and parent folder ID is null (root folders).
     *
     * @param projectId The project ID
     * @return List of root folders
     */
    List<Folder> findByProjectIdAndParentFolderIsNull(Long projectId);

    /**
     * Find folders by parent folder ID.
     *
     * @param parentFolderId The parent folder ID
     * @return List of subfolders
     */
    List<Folder> findByParentFolderId(Long parentFolderId);

    /**
     * Find folder by project ID and name, where parent folder is null.
     *
     * @param projectId The project ID
     * @param name The folder name
     * @return Optional folder
     */
    Optional<Folder> findByProjectIdAndParentFolderIsNullAndName(Long projectId, String name);

    /**
     * Find folder by project ID, parent folder ID, and name.
     *
     * @param projectId The project ID
     * @param parentFolderId The parent folder ID
     * @param name The folder name
     * @return Optional folder
     */
    Optional<Folder> findByProjectIdAndParentFolderIdAndName(Long projectId, Long parentFolderId, String name);
} 