package com.vtnet.pdms.domain.repository;

import com.vtnet.pdms.domain.model.ChatReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for ChatReference entity.
 */
@Repository
public interface ChatReferenceRepository extends JpaRepository<ChatReference, Long> {

    /**
     * Find references by message ID.
     *
     * @param messageId The message ID
     * @return List of chat references
     */
    List<ChatReference> findByMessageIdOrderByRelevanceScoreDesc(Long messageId);
    
    /**
     * Find references by document ID.
     *
     * @param documentId The document ID
     * @return List of chat references
     */
    List<ChatReference> findByDocumentId(Long documentId);
    
    /**
     * Find references by message ID and document ID.
     *
     * @param messageId The message ID
     * @param documentId The document ID
     * @return List of chat references
     */
    List<ChatReference> findByMessageIdAndDocumentId(Long messageId, Long documentId);
    
    /**
     * Find references by conversation ID.
     *
     * @param conversationId The conversation ID
     * @return List of chat references
     */
    @Query("SELECT r FROM ChatReference r JOIN r.message m JOIN m.conversation c WHERE c.id = :conversationId ORDER BY r.relevanceScore DESC")
    List<ChatReference> findByConversationId(@Param("conversationId") Long conversationId);
    
    /**
     * Find references by user ID and project ID.
     *
     * @param userId The user ID
     * @param projectId The project ID
     * @return List of chat references
     */
    @Query("SELECT r FROM ChatReference r JOIN r.message m JOIN m.conversation c WHERE c.user.id = :userId AND c.project.id = :projectId ORDER BY r.relevanceScore DESC")
    List<ChatReference> findByUserIdAndProjectId(@Param("userId") Long userId, @Param("projectId") Long projectId);
    
    /**
     * Delete references by message ID.
     *
     * @param messageId The message ID
     */
    void deleteByMessageId(Long messageId);
    
    /**
     * Delete references by document ID.
     *
     * @param documentId The document ID
     */
    void deleteByDocumentId(Long documentId);
} 