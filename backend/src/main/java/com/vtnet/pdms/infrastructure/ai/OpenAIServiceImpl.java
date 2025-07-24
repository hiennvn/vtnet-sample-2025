package com.vtnet.pdms.infrastructure.ai;

import com.vtnet.pdms.domain.service.OpenAIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Implementation of OpenAIService using the OpenAI API.
 */
@Service
public class OpenAIServiceImpl implements OpenAIService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAIServiceImpl.class);
    private static final String OPENAI_API_URL = "https://api.openai.com/v1";
    private static final String CHAT_COMPLETION_ENDPOINT = "/chat/completions";
    private static final String EMBEDDINGS_ENDPOINT = "/embeddings";
    private static final String MODELS_ENDPOINT = "/models";
    
    private static final Pattern DOCUMENT_TITLE_PATTERN = Pattern.compile("document\\s+[\"']?([^\"']+)[\"']?\\s+about", Pattern.CASE_INSENSITIVE);
    private static final Pattern DOCUMENT_CONTENT_PATTERN = Pattern.compile("content\\s+of\\s+document\\s+[\"']?([^\"']+)[\"']?", Pattern.CASE_INSENSITIVE);
    
    @Value("${openai.api.key:}")
    private String apiKey;
    
    @Value("${openai.model.completion:gpt-3.5-turbo}")
    private String completionModel;
    
    @Value("${openai.model.embedding:text-embedding-ada-002}")
    private String embeddingModel;
    
    private final RestTemplate restTemplate;
    
    /**
     * Constructor with dependency injection.
     */
    public OpenAIServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String generateResponse(String query, String context) {
        logger.info("Generating response for query: {}", query);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", completionModel);
        
        List<Map<String, String>> messages = new ArrayList<>();
        
        // System message with instructions
        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a helpful assistant that answers questions based on the provided context. " +
                "If the answer is not in the context, say that you don't have enough information to answer the question. " +
                "Keep your answers concise and to the point.");
        messages.add(systemMessage);
        
        // Context message
        if (context != null && !context.isEmpty()) {
            Map<String, String> contextMessage = new HashMap<>();
            contextMessage.put("role", "system");
            contextMessage.put("content", "Here is the context to use for answering the question: " + context);
            messages.add(contextMessage);
        }
        
        // User query
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", query);
        messages.add(userMessage);
        
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.3);
        requestBody.put("max_tokens", 500);
        
        HttpHeaders headers = createHeaders();
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(
                    OPENAI_API_URL + CHAT_COMPLETION_ENDPOINT,
                    requestEntity,
                    Map.class
            );
            
            Map<String, Object> responseBody = responseEntity.getBody();
            if (responseBody != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, String> message = (Map<String, String>) choice.get("message");
                    if (message != null) {
                        return message.get("content");
                    }
                }
            }
            
            logger.error("Failed to parse response from OpenAI API: {}", responseBody);
            return "Sorry, I couldn't generate a response. Please try again later.";
        } catch (Exception e) {
            logger.error("Error calling OpenAI API: {}", e.getMessage(), e);
            return "Sorry, there was an error processing your request. Please try again later.";
        }
    }

    @Override
    public Map<String, Object> generateResponseWithSources(String query, String context, Map<Long, String> documentReferences) {
        logger.info("Generating response with sources for query: {}", query);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", completionModel);
        
        List<Map<String, String>> messages = new ArrayList<>();
        
        // System message with instructions
        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a helpful assistant that answers questions based on the provided context. " +
                "If the answer is not in the context, say that you don't have enough information to answer the question. " +
                "Keep your answers concise and to the point. " +
                "You must cite your sources using [doc_id] notation when you use information from the context. " +
                "Each document has a unique ID that you should include in your citations.");
        messages.add(systemMessage);
        
        // Context message with document IDs
        if (context != null && !context.isEmpty()) {
            StringBuilder contextBuilder = new StringBuilder("Here is the context to use for answering the question:\n\n");
            
            for (Map.Entry<Long, String> entry : documentReferences.entrySet()) {
                Long docId = entry.getKey();
                String content = entry.getValue();
                contextBuilder.append("[doc_").append(docId).append("]: ").append(content).append("\n\n");
            }
            
            Map<String, String> contextMessage = new HashMap<>();
            contextMessage.put("role", "system");
            contextMessage.put("content", contextBuilder.toString());
            messages.add(contextMessage);
        }
        
        // User query
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", query);
        messages.add(userMessage);
        
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.3);
        requestBody.put("max_tokens", 800);
        
        HttpHeaders headers = createHeaders();
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(
                    OPENAI_API_URL + CHAT_COMPLETION_ENDPOINT,
                    requestEntity,
                    Map.class
            );
            
            Map<String, Object> responseBody = responseEntity.getBody();
            if (responseBody != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, String> message = (Map<String, String>) choice.get("message");
                    if (message != null) {
                        String response = message.get("content");
                        
                        // Extract source references from the response
                        Set<Long> sourcesUsed = extractSourceReferences(response);
                        
                        Map<String, Object> result = new HashMap<>();
                        result.put("response", response);
                        result.put("sources", sourcesUsed);
                        
                        return result;
                    }
                }
            }
            
            logger.error("Failed to parse response from OpenAI API: {}", responseBody);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("response", "Sorry, I couldn't generate a response. Please try again later.");
            errorResult.put("sources", Collections.emptyList());
            return errorResult;
        } catch (Exception e) {
            logger.error("Error calling OpenAI API: {}", e.getMessage(), e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("response", "Sorry, there was an error processing your request. Please try again later.");
            errorResult.put("sources", Collections.emptyList());
            return errorResult;
        }
    }

    @Override
    public float[] createEmbedding(String text) {
        logger.info("Creating embedding for text of length: {}", text.length());
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", embeddingModel);
        requestBody.put("input", text);
        
        HttpHeaders headers = createHeaders();
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(
                    OPENAI_API_URL + EMBEDDINGS_ENDPOINT,
                    requestEntity,
                    Map.class
            );
            
            Map<String, Object> responseBody = responseEntity.getBody();
            if (responseBody != null) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) responseBody.get("data");
                if (data != null && !data.isEmpty()) {
                    Map<String, Object> embedding = data.get(0);
                    List<Double> embeddingValues = (List<Double>) embedding.get("embedding");
                    if (embeddingValues != null) {
                        float[] result = new float[embeddingValues.size()];
                        for (int i = 0; i < embeddingValues.size(); i++) {
                            result[i] = embeddingValues.get(i).floatValue();
                        }
                        return result;
                    }
                }
            }
            
            logger.error("Failed to parse embedding from OpenAI API: {}", responseBody);
            return new float[0];
        } catch (Exception e) {
            logger.error("Error calling OpenAI API for embedding: {}", e.getMessage(), e);
            return new float[0];
        }
    }

    @Override
    public String extractDocumentTitle(String query) {
        logger.info("Extracting document title from query: {}", query);
        
        // Check for "document [title] about" pattern
        Matcher documentTitleMatcher = DOCUMENT_TITLE_PATTERN.matcher(query);
        if (documentTitleMatcher.find()) {
            return documentTitleMatcher.group(1).trim();
        }
        
        // Check for "content of document [title]" pattern
        Matcher documentContentMatcher = DOCUMENT_CONTENT_PATTERN.matcher(query);
        if (documentContentMatcher.find()) {
            return documentContentMatcher.group(1).trim();
        }
        
        // If no pattern matches, return null
        return null;
    }

    @Override
    public List<String> getAvailableModels() {
        logger.info("Getting available models from OpenAI API");
        
        HttpHeaders headers = createHeaders();
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<Map> responseEntity = restTemplate.getForEntity(
                    OPENAI_API_URL + MODELS_ENDPOINT,
                    Map.class,
                    requestEntity
            );
            
            Map<String, Object> responseBody = responseEntity.getBody();
            if (responseBody != null) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) responseBody.get("data");
                if (data != null) {
                    List<String> modelIds = new ArrayList<>();
                    for (Map<String, Object> model : data) {
                        String id = (String) model.get("id");
                        if (id != null) {
                            modelIds.add(id);
                        }
                    }
                    return modelIds;
                }
            }
            
            logger.error("Failed to parse models from OpenAI API: {}", responseBody);
            return Collections.emptyList();
        } catch (Exception e) {
            logger.error("Error calling OpenAI API for models: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }
    
    /**
     * Creates HTTP headers for OpenAI API requests.
     *
     * @return The HTTP headers
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        return headers;
    }
    
    /**
     * Extracts source references from a response.
     *
     * @param response The response text
     * @return Set of document IDs referenced in the response
     */
    private Set<Long> extractSourceReferences(String response) {
        Set<Long> sources = new HashSet<>();
        Pattern pattern = Pattern.compile("\\[doc_(\\d+)\\]");
        Matcher matcher = pattern.matcher(response);
        
        while (matcher.find()) {
            try {
                Long docId = Long.parseLong(matcher.group(1));
                sources.add(docId);
            } catch (NumberFormatException e) {
                logger.warn("Invalid document ID in response: {}", matcher.group(1));
            }
        }
        
        return sources;
    }
} 