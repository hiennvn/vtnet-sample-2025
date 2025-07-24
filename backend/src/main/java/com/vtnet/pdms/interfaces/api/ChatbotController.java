package com.vtnet.pdms.interfaces.api;

import com.vtnet.pdms.domain.service.ChatbotService;
import com.vtnet.pdms.infrastructure.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for chatbot operations.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Chatbot", description = "Chatbot APIs")
@SecurityRequirement(name = "bearerAuth")
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final SecurityUtils securityUtils;

    /**
     * Constructor with dependency injection.
     *
     * @param chatbotService Service for chatbot operations
     * @param securityUtils Security utilities
     */
    @Autowired
    public ChatbotController(ChatbotService chatbotService, SecurityUtils securityUtils) {
        this.chatbotService = chatbotService;
        this.securityUtils = securityUtils;
    }

    /**
     * POST /api/projects/{projectId}/chat : Ask a question about a project.
     *
     * @param projectId The project ID
     * @param request The chat request
     * @return The chat response
     */
    @PostMapping("/projects/{projectId}/chat")
    @Operation(
        summary = "Ask a question about a project",
        description = "Ask a question about documents in a specific project",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Project not found")
        }
    )
    @PreAuthorize("@customPermissionEvaluator.hasProjectAccess(#projectId)")
    public ResponseEntity<Map<String, Object>> askProjectQuestion(
            @PathVariable Long projectId,
            @Valid @RequestBody ChatRequest request) {
        
        Long userId = securityUtils.getCurrentUserId();
        
        Map<String, Object> response;
        if (request.getDocumentName() != null && !request.getDocumentName().isEmpty()) {
            // Question about a specific document
            response = chatbotService.processDocumentQuestion(request.getQuestion(), request.getDocumentName(), projectId, userId);
        } else {
            // General project question
            response = chatbotService.processProjectQuestion(request.getQuestion(), projectId, userId);
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/projects/{projectId}/chat/history : Get chat history for a project.
     *
     * @param projectId The project ID
     * @param limit The maximum number of messages to retrieve (optional)
     * @return The chat history
     */
    @GetMapping("/projects/{projectId}/chat/history")
    @Operation(
        summary = "Get chat history for a project",
        description = "Get the conversation history for a specific project",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Project not found")
        }
    )
    @PreAuthorize("@customPermissionEvaluator.hasProjectAccess(#projectId)")
    public ResponseEntity<List<Map<String, Object>>> getProjectChatHistory(
            @PathVariable Long projectId,
            @RequestParam(required = false, defaultValue = "20") int limit) {
        
        Long userId = securityUtils.getCurrentUserId();
        List<Map<String, Object>> history = chatbotService.getConversationHistory(projectId, userId, limit);
        
        return ResponseEntity.ok(history);
    }

    /**
     * POST /api/chat : Ask a question across all projects.
     *
     * @param request The chat request
     * @return The chat response
     */
    @PostMapping("/chat")
    @Operation(
        summary = "Ask a question across all projects",
        description = "Ask a question that searches across all accessible projects (Director role required)",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires Director role")
        }
    )
    @PreAuthorize("hasRole('ROLE_DIRECTOR')")
    public ResponseEntity<Map<String, Object>> askGlobalQuestion(
            @Valid @RequestBody ChatRequest request) {
        
        Long userId = securityUtils.getCurrentUserId();
        Map<String, Object> response = chatbotService.processGlobalQuestion(request.getQuestion(), userId);
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/chat/history : Get global chat history.
     *
     * @param limit The maximum number of messages to retrieve (optional)
     * @return The chat history
     */
    @GetMapping("/chat/history")
    @Operation(
        summary = "Get global chat history",
        description = "Get the conversation history for global questions (Director role required)",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires Director role")
        }
    )
    @PreAuthorize("hasRole('ROLE_DIRECTOR')")
    public ResponseEntity<List<Map<String, Object>>> getGlobalChatHistory(
            @RequestParam(required = false, defaultValue = "20") int limit) {
        
        Long userId = securityUtils.getCurrentUserId();
        List<Map<String, Object>> history = chatbotService.getGlobalConversationHistory(userId, limit);
        
        return ResponseEntity.ok(history);
    }

    /**
     * Chat request DTO.
     */
    public static class ChatRequest {
        
        @NotBlank
        private String question;
        
        private String documentName;
        
        public String getQuestion() {
            return question;
        }
        
        public void setQuestion(String question) {
            this.question = question;
        }
        
        public String getDocumentName() {
            return documentName;
        }
        
        public void setDocumentName(String documentName) {
            this.documentName = documentName;
        }
    }
} 