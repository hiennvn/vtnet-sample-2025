package com.vtnet.pdms.application.service;

import com.vtnet.pdms.domain.model.*;
import com.vtnet.pdms.domain.repository.*;
import com.vtnet.pdms.domain.service.ChatbotService;
import com.vtnet.pdms.domain.service.OpenAIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of ChatbotService.
 */
@Service
public class ChatbotServiceImpl implements ChatbotService {

    private static final Logger logger = LoggerFactory.getLogger(ChatbotServiceImpl.class);
    private static final int MAX_CONTEXT_LENGTH = 8000;

    private final OpenAIService openAIService;
    private final DocumentRepository documentRepository;
    private final DocumentContentRepository documentContentRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatConversationRepository chatConversationRepository;
    private final ChatReferenceRepository chatReferenceRepository;

    /**
     * Constructor with dependency injection.
     */
    @Autowired
    public ChatbotServiceImpl(
            OpenAIService openAIService,
            DocumentRepository documentRepository,
            DocumentContentRepository documentContentRepository,
            UserRepository userRepository,
            ChatMessageRepository chatMessageRepository,
            ChatConversationRepository chatConversationRepository,
            ChatReferenceRepository chatReferenceRepository) {
        this.openAIService = openAIService;
        this.documentRepository = documentRepository;
        this.documentContentRepository = documentContentRepository;
        this.userRepository = userRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.chatConversationRepository = chatConversationRepository;
        this.chatReferenceRepository = chatReferenceRepository;
    }

    @Override
    @Transactional
    public Map<String, Object> processProjectQuestion(String question, Long projectId, Long userId) {
        logger.info("Processing project question: {}, projectId: {}, userId: {}", question, projectId, userId);
        
        // Check if the question is about a specific document
        String documentTitle = openAIService.extractDocumentTitle(question);
        if (documentTitle != null) {
            return processDocumentQuestion(question, documentTitle, projectId, userId);
        }
        
        // Get relevant document content from the project
        List<DocumentContent> projectDocuments = documentContentRepository.findByProjectId(projectId);
        String context = buildContext(projectDocuments);
        
        // Generate response with document references
        Map<Long, String> documentReferences = extractDocumentReferences(projectDocuments);
        Map<String, Object> response = openAIService.generateResponseWithSources(question, context, documentReferences);
        
        // Save conversation
        List<Long> sourceRefs = extractSourceRefIds(response);
        saveConversation(question, (String) response.get("response"), projectId, userId, sourceRefs);
        
        return response;
    }

    @Override
    @Transactional
    public Map<String, Object> processDocumentQuestion(String question, String documentName, Long projectId, Long userId) {
        logger.info("Processing document question: {}, documentName: {}, projectId: {}, userId: {}", 
                question, documentName, projectId, userId);
        
        // Find the document content
        Optional<DocumentContent> documentContentOpt;
        if (projectId != null) {
            documentContentOpt = documentContentRepository.findByDocumentNameAndProjectIdLatestVersion(documentName, projectId);
        } else {
            documentContentOpt = documentContentRepository.findByDocumentNameLatestVersion(documentName);
        }
        
        if (documentContentOpt.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            String errorMessage = "Document '" + documentName + "' not found or you don't have access to it.";
            response.put("response", errorMessage);
            response.put("sources", Collections.emptyList());
            
            // Save conversation without sources
            saveConversation(question, errorMessage, projectId, userId, Collections.emptyList());
            
            return response;
        }
        
        DocumentContent documentContent = documentContentOpt.get();
        String context = documentContent.getContentText();
        
        // Generate response with document references
        Map<Long, String> documentReferences = new HashMap<>();
        Long documentId = documentContent.getDocumentVersion().getDocument().getId();
        documentReferences.put(documentId, documentContent.getContentText());
        
        Map<String, Object> response = openAIService.generateResponseWithSources(question, context, documentReferences);
        
        // Save conversation
        List<Long> sourceRefs = extractSourceRefIds(response);
        saveConversation(question, (String) response.get("response"), projectId, userId, sourceRefs);
        
        return response;
    }

    @Override
    @Transactional
    public Map<String, Object> processGlobalQuestion(String question, Long userId) {
        logger.info("Processing global question: {}, userId: {}", question, userId);
        
        // Check if the question is about a specific document
        String documentTitle = openAIService.extractDocumentTitle(question);
        if (documentTitle != null) {
            return processDocumentQuestion(question, documentTitle, null, userId);
        }
        
        // Get all document content the user has access to
        // This is a simplification - in a real implementation, you'd need to check user permissions
        List<DocumentContent> allDocuments = documentContentRepository.findAll();
        String context = buildContext(allDocuments);
        
        // Generate response with document references
        Map<Long, String> documentReferences = extractDocumentReferences(allDocuments);
        Map<String, Object> response = openAIService.generateResponseWithSources(question, context, documentReferences);
        
        // Save conversation
        List<Long> sourceRefs = extractSourceRefIds(response);
        saveConversation(question, (String) response.get("response"), null, userId, sourceRefs);
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getConversationHistory(Long projectId, Long userId, int limit) {
        logger.info("Getting conversation history for projectId: {}, userId: {}, limit: {}", projectId, userId, limit);
        
        Pageable pageable = PageRequest.of(0, limit);
        List<ChatMessage> messages = chatMessageRepository.findByUserIdAndProjectId(userId, projectId, pageable);
        
        return convertMessagesToMap(messages);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getGlobalConversationHistory(Long userId, int limit) {
        logger.info("Getting global conversation history for userId: {}, limit: {}", userId, limit);
        
        Pageable pageable = PageRequest.of(0, limit);
        List<ChatMessage> messages = chatMessageRepository.findByUserIdAndGlobalConversation(userId, pageable);
        
        return convertMessagesToMap(messages);
    }

    @Override
    @Transactional
    public List<Long> saveConversation(String userMessage, String botResponse, Long projectId, Long userId, List<Long> sourceReferences) {
        logger.info("Saving conversation: userId: {}, projectId: {}", userId, projectId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        Project project = null;
        if (projectId != null) {
            // In a real implementation, you'd get the project and check permissions
            // For simplicity, we're assuming the project exists and the user has access
        }
        
        // Find or create conversation
        ChatConversation conversation;
        if (projectId != null) {
            Optional<ChatConversation> existingConversation = 
                    chatConversationRepository.findFirstByUserIdAndProjectIdOrderByLastMessageAtDesc(userId, projectId);
            conversation = existingConversation.orElseGet(() -> new ChatConversation(user, project));
        } else {
            Optional<ChatConversation> existingConversation = 
                    chatConversationRepository.findFirstByUserIdAndProjectIsNullOrderByLastMessageAtDesc(userId);
            conversation = existingConversation.orElseGet(() -> new ChatConversation(user, null));
        }
        
        if (conversation.getId() == null) {
            conversation = chatConversationRepository.save(conversation);
        }
        
        // Add user message
        ChatMessage userMsg = conversation.addUserMessage(userMessage);
        userMsg = chatMessageRepository.save(userMsg);
        
        // Add bot message
        ChatMessage botMsg = conversation.addBotMessage(botResponse);
        botMsg = chatMessageRepository.save(botMsg);
        
        // Update conversation last message time
        conversation.setLastMessageAt(botMsg.getSentAt());
        chatConversationRepository.save(conversation);
        
        // Add references to bot message
        for (Long documentId : sourceReferences) {
            Document document = documentRepository.findById(documentId).orElse(null);
            if (document != null) {
                ChatReference reference = botMsg.addReference(document, 1.0f);
                chatReferenceRepository.save(reference);
            }
        }
        
        return Arrays.asList(userMsg.getId(), botMsg.getId());
    }

    /**
     * Builds context from document content.
     *
     * @param documents List of document contents
     * @return Combined context string
     */
    private String buildContext(List<DocumentContent> documents) {
        StringBuilder context = new StringBuilder();
        
        for (DocumentContent doc : documents) {
            String content = doc.getContentText();
            if (content != null && !content.isEmpty()) {
                Document document = doc.getDocumentVersion().getDocument();
                context.append("Document: ").append(document.getName()).append("\n");
                context.append("Content: ").append(content).append("\n\n");
                
                // Check if we've exceeded the maximum context length
                if (context.length() > MAX_CONTEXT_LENGTH) {
                    context.setLength(MAX_CONTEXT_LENGTH);
                    break;
                }
            }
        }
        
        return context.toString();
    }

    /**
     * Extracts document references from document content.
     *
     * @param documents List of document contents
     * @return Map of document IDs to content snippets
     */
    private Map<Long, String> extractDocumentReferences(List<DocumentContent> documents) {
        Map<Long, String> references = new HashMap<>();
        
        for (DocumentContent doc : documents) {
            String content = doc.getContentText();
            if (content != null && !content.isEmpty()) {
                Document document = doc.getDocumentVersion().getDocument();
                references.put(document.getId(), content);
            }
        }
        
        return references;
    }

    /**
     * Extracts source reference IDs from response.
     *
     * @param response Response map
     * @return List of document IDs
     */
    @SuppressWarnings("unchecked")
    private List<Long> extractSourceRefIds(Map<String, Object> response) {
        List<Map<String, Object>> sources = (List<Map<String, Object>>) response.get("sources");
        if (sources == null) {
            return Collections.emptyList();
        }
        
        return sources.stream()
                .map(source -> (Long) source.get("id"))
                .collect(Collectors.toList());
    }

    /**
     * Converts chat messages to map format for API responses.
     *
     * @param messages List of chat messages
     * @return List of message maps
     */
    private List<Map<String, Object>> convertMessagesToMap(List<ChatMessage> messages) {
        return messages.stream().map(message -> {
            Map<String, Object> messageMap = new HashMap<>();
            messageMap.put("id", message.getId());
            messageMap.put("type", message.getMessageType());
            messageMap.put("content", message.getContent());
            messageMap.put("sentAt", message.getSentAt());
            
            // Add references if any
            if (!message.getReferences().isEmpty()) {
                List<Map<String, Object>> references = message.getReferences().stream()
                        .map(ref -> {
                            Map<String, Object> refMap = new HashMap<>();
                            refMap.put("documentId", ref.getDocument().getId());
                            refMap.put("documentName", ref.getDocument().getName());
                            refMap.put("relevanceScore", ref.getRelevanceScore());
                            return refMap;
                        })
                        .collect(Collectors.toList());
                messageMap.put("references", references);
            }
            
            return messageMap;
        }).collect(Collectors.toList());
    }
} 