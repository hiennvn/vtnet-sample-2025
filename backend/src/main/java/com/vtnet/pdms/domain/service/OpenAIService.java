package com.vtnet.pdms.domain.service;

import java.util.List;
import java.util.Map;

/**
 * Service interface for OpenAI API integration.
 */
public interface OpenAIService {

    /**
     * Generates a response based on the provided query and context.
     *
     * @param query The user's query
     * @param context The document context to use for generating the response
     * @return The generated response
     */
    String generateResponse(String query, String context);
    
    /**
     * Generates a response with source references based on the provided query and context.
     *
     * @param query The user's query
     * @param context The document context to use for generating the response
     * @param documentReferences Map of document IDs to their content snippets
     * @return Map containing the response and source references
     */
    Map<String, Object> generateResponseWithSources(String query, String context, Map<Long, String> documentReferences);
    
    /**
     * Creates an embedding vector for the provided text.
     *
     * @param text The text to create an embedding for
     * @return The embedding vector as a float array
     */
    float[] createEmbedding(String text);
    
    /**
     * Extracts document title from a user query.
     *
     * @param query The user's query
     * @return The extracted document title, or null if no title was found
     */
    String extractDocumentTitle(String query);
    
    /**
     * Gets the available models from the OpenAI API.
     *
     * @return List of available model names
     */
    List<String> getAvailableModels();
} 