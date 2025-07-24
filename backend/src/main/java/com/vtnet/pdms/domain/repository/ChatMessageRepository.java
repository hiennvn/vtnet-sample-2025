package com.vtnet.pdms.domain.repository;

import com.vtnet.pdms.domain.model.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for ChatMessage entity.
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * Find messages by conversation ID.
     *
     * @param conversationId The conversation ID
     * @return List of chat messages
     */
    List<ChatMessage> findByConversationIdOrderBySentAtDesc(Long conversationId);
    
    /**
     * Find messages by conversation ID with pagination.
     *
     * @param conversationId The conversation ID
     * @param pageable Pagination information
     * @return List of chat messages
     */
    List<ChatMessage> findByConversationIdOrderBySentAtDesc(Long conversationId, Pageable pageable);
    
    /**
     * Find messages by user ID and project ID.
     *
     * @param userId The user ID
     * @param projectId The project ID
     * @return List of chat messages
     */
    @Query("SELECT m FROM ChatMessage m JOIN m.conversation c WHERE c.user.id = :userId AND c.project.id = :projectId ORDER BY m.sentAt DESC")
    List<ChatMessage> findByUserIdAndProjectId(@Param("userId") Long userId, @Param("projectId") Long projectId);
    
    /**
     * Find messages by user ID and project ID with pagination.
     *
     * @param userId The user ID
     * @param projectId The project ID
     * @param pageable Pagination information
     * @return List of chat messages
     */
    @Query("SELECT m FROM ChatMessage m JOIN m.conversation c WHERE c.user.id = :userId AND c.project.id = :projectId ORDER BY m.sentAt DESC")
    List<ChatMessage> findByUserIdAndProjectId(@Param("userId") Long userId, @Param("projectId") Long projectId, Pageable pageable);
    
    /**
     * Find messages by user ID for global conversations.
     *
     * @param userId The user ID
     * @return List of chat messages
     */
    @Query("SELECT m FROM ChatMessage m JOIN m.conversation c WHERE c.user.id = :userId AND c.project IS NULL ORDER BY m.sentAt DESC")
    List<ChatMessage> findByUserIdAndGlobalConversation(@Param("userId") Long userId);
    
    /**
     * Find messages by user ID for global conversations with pagination.
     *
     * @param userId The user ID
     * @param pageable Pagination information
     * @return List of chat messages
     */
    @Query("SELECT m FROM ChatMessage m JOIN m.conversation c WHERE c.user.id = :userId AND c.project IS NULL ORDER BY m.sentAt DESC")
    List<ChatMessage> findByUserIdAndGlobalConversation(@Param("userId") Long userId, Pageable pageable);
} 