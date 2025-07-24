package com.vtnet.pdms.domain.repository;

import com.vtnet.pdms.domain.model.DocumentContent;
import com.vtnet.pdms.domain.model.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for DocumentContent entity.
 */
@Repository
public interface DocumentContentRepository extends JpaRepository<DocumentContent, Long> {

    /**
     * Find document content by document version ID.
     *
     * @param documentVersionId The document version ID
     * @return Optional document content
     */
    Optional<DocumentContent> findByDocumentVersionId(Long documentVersionId);

    /**
     * Find document content by document version.
     *
     * @param documentVersion The document version
     * @return Optional document content
     */
    Optional<DocumentContent> findByDocumentVersion(DocumentVersion documentVersion);

    /**
     * Find document contents by embedding status.
     *
     * @param embeddingStatus The embedding status
     * @return List of document contents
     */
    List<DocumentContent> findByEmbeddingStatus(String embeddingStatus);

    /**
     * Find document contents by document ID.
     *
     * @param documentId The document ID
     * @return List of document contents
     */
    @Query("SELECT dc FROM DocumentContent dc JOIN dc.documentVersion dv WHERE dv.document.id = :documentId")
    List<DocumentContent> findByDocumentId(@Param("documentId") Long documentId);

    /**
     * Find document contents by project ID.
     *
     * @param projectId The project ID
     * @return List of document contents
     */
    @Query("SELECT dc FROM DocumentContent dc JOIN dc.documentVersion dv JOIN dv.document d JOIN d.folder f WHERE f.project.id = :projectId")
    List<DocumentContent> findByProjectId(@Param("projectId") Long projectId);

    /**
     * Find document content by document name (latest version).
     *
     * @param documentName The document name
     * @return Optional document content
     */
    @Query("SELECT dc FROM DocumentContent dc JOIN dc.documentVersion dv JOIN dv.document d " +
           "WHERE d.name = :documentName AND dv.versionNumber = " +
           "(SELECT MAX(dv2.versionNumber) FROM DocumentVersion dv2 WHERE dv2.document = d)")
    Optional<DocumentContent> findByDocumentNameLatestVersion(@Param("documentName") String documentName);

    /**
     * Find document content by document name and project ID (latest version).
     *
     * @param documentName The document name
     * @param projectId The project ID
     * @return Optional document content
     */
    @Query("SELECT dc FROM DocumentContent dc JOIN dc.documentVersion dv JOIN dv.document d JOIN d.folder f " +
           "WHERE d.name = :documentName AND f.project.id = :projectId AND dv.versionNumber = " +
           "(SELECT MAX(dv2.versionNumber) FROM DocumentVersion dv2 WHERE dv2.document = d)")
    Optional<DocumentContent> findByDocumentNameAndProjectIdLatestVersion(
            @Param("documentName") String documentName, 
            @Param("projectId") Long projectId);
} 