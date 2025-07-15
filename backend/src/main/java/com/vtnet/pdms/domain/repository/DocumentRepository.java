package com.vtnet.pdms.domain.repository;

import com.vtnet.pdms.domain.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Document entity.
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    /**
     * Find documents by folder ID.
     *
     * @param folderId The folder ID
     * @return List of documents
     */
    List<Document> findByFolderId(Long folderId);

    /**
     * Find documents by folder ID ordered by display order.
     *
     * @param folderId The folder ID
     * @return List of documents
     */
    List<Document> findByFolderIdOrderByDisplayOrderAsc(Long folderId);

    /**
     * Find document by folder ID and name.
     *
     * @param folderId The folder ID
     * @param name The document name
     * @return Optional document
     */
    Optional<Document> findByFolderIdAndName(Long folderId, String name);

    /**
     * Find documents by project ID.
     *
     * @param projectId The project ID
     * @return List of documents
     */
    @Query("SELECT d FROM Document d JOIN d.folder f WHERE f.project.id = :projectId")
    List<Document> findByProjectId(@Param("projectId") Long projectId);

    /**
     * Find documents by project ID and name containing.
     *
     * @param projectId The project ID
     * @param name The document name fragment
     * @return List of documents
     */
    @Query("SELECT d FROM Document d JOIN d.folder f WHERE f.project.id = :projectId AND LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Document> findByProjectIdAndNameContainingIgnoreCase(@Param("projectId") Long projectId, @Param("name") String name);
} 