package com.vtnet.pdms.domain.service;

import java.util.List;
import java.util.Map;

/**
 * Service interface for chatbot functionality.
 */
public interface ChatbotService {

    /**
     * Processes a user question for a specific project.
     *
     * @param question The user's question
     * @param projectId The project ID
     * @param userId The user ID
     * @return Map containing the response and source references
     */
    Map<String, Object> processProjectQuestion(String question, Long projectId, Long userId);
    
    /**
     * Processes a user question about a specific document.
     *
     * @param question The user's question
     * @param documentName The document name
     * @param projectId The project ID
     * @param userId The user ID
     * @return Map containing the response and source references
     */
    Map<String, Object> processDocumentQuestion(String question, String documentName, Long projectId, Long userId);
    
    /**
     * Processes a user question across all accessible projects (for Directors).
     *
     * @param question The user's question
     * @param userId The user ID
     * @return Map containing the response and source references
     */
    Map<String, Object> processGlobalQuestion(String question, Long userId);
    
    /**
     * Retrieves conversation history for a user in a project.
     *
     * @param projectId The project ID
     * @param userId The user ID
     * @param limit The maximum number of messages to retrieve
     * @return List of conversation messages
     */
    List<Map<String, Object>> getConversationHistory(Long projectId, Long userId, int limit);
    
    /**
     * Retrieves global conversation history for a user.
     *
     * @param userId The user ID
     * @param limit The maximum number of messages to retrieve
     * @return List of conversation messages
     */
    List<Map<String, Object>> getGlobalConversationHistory(Long userId, int limit);
    
    /**
     * Saves a user message and bot response to the conversation history.
     *
     * @param userMessage The user's message
     * @param botResponse The bot's response
     * @param projectId The project ID (can be null for global conversations)
     * @param userId The user ID
     * @param sourceReferences The source references used in the response
     * @return The saved conversation message IDs
     */
    List<Long> saveConversation(String userMessage, String botResponse, Long projectId, Long userId, List<Long> sourceReferences);
} 