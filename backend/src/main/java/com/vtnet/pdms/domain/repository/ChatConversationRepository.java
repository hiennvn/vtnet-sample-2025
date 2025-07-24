package com.vtnet.pdms.domain.repository;

import com.vtnet.pdms.domain.model.ChatConversation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ChatConversation entity.
 */
@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {

    /**
     * Find conversations by user ID.
     *
     * @param userId The user ID
     * @return List of chat conversations
     */
    List<ChatConversation> findByUserIdOrderByLastMessageAtDesc(Long userId);
    
    /**
     * Find conversations by user ID with pagination.
     *
     * @param userId The user ID
     * @param pageable Pagination information
     * @return List of chat conversations
     */
    List<ChatConversation> findByUserIdOrderByLastMessageAtDesc(Long userId, Pageable pageable);
    
    /**
     * Find conversations by user ID and project ID.
     *
     * @param userId The user ID
     * @param projectId The project ID
     * @return List of chat conversations
     */
    List<ChatConversation> findByUserIdAndProjectIdOrderByLastMessageAtDesc(Long userId, Long projectId);
    
    /**
     * Find conversations by user ID and project ID with pagination.
     *
     * @param userId The user ID
     * @param projectId The project ID
     * @param pageable Pagination information
     * @return List of chat conversations
     */
    List<ChatConversation> findByUserIdAndProjectIdOrderByLastMessageAtDesc(Long userId, Long projectId, Pageable pageable);
    
    /**
     * Find global conversations by user ID.
     *
     * @param userId The user ID
     * @return List of chat conversations
     */
    List<ChatConversation> findByUserIdAndProjectIsNullOrderByLastMessageAtDesc(Long userId);
    
    /**
     * Find global conversations by user ID with pagination.
     *
     * @param userId The user ID
     * @param pageable Pagination information
     * @return List of chat conversations
     */
    List<ChatConversation> findByUserIdAndProjectIsNullOrderByLastMessageAtDesc(Long userId, Pageable pageable);
    
    /**
     * Find the most recent conversation for a user and project.
     *
     * @param userId The user ID
     * @param projectId The project ID
     * @return Optional chat conversation
     */
    Optional<ChatConversation> findFirstByUserIdAndProjectIdOrderByLastMessageAtDesc(Long userId, Long projectId);
    
    /**
     * Find the most recent global conversation for a user.
     *
     * @param userId The user ID
     * @return Optional chat conversation
     */
    Optional<ChatConversation> findFirstByUserIdAndProjectIsNullOrderByLastMessageAtDesc(Long userId);
} 