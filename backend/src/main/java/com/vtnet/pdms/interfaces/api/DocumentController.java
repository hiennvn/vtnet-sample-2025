package com.vtnet.pdms.interfaces.api;

import com.vtnet.pdms.application.dto.DocumentDTO;
import com.vtnet.pdms.application.mapper.DocumentMapper;
import com.vtnet.pdms.domain.model.Document;
import com.vtnet.pdms.domain.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing documents.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Document", description = "Document management APIs")
@SecurityRequirement(name = "bearerAuth")
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentMapper documentMapper;

    /**
     * Constructor with dependency injection.
     *
     * @param documentService Service for document operations
     * @param documentMapper Mapper for document entity-DTO conversion
     */
    @Autowired
    public DocumentController(DocumentService documentService, DocumentMapper documentMapper) {
        this.documentService = documentService;
        this.documentMapper = documentMapper;
    }

    /**
     * GET /api/projects/{id}/documents : Get all documents for a project.
     *
     * @param projectId The project ID
     * @return List of documents
     */
    @GetMapping("/projects/{projectId}/documents")
    @Operation(
        summary = "Get all documents for a project",
        description = "Get all documents for a project across all folders",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = DocumentDTO.class))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Project not found")
        }
    )
    public ResponseEntity<List<DocumentDTO>> getProjectDocuments(@PathVariable Long projectId) {
        List<Document> documents = documentService.getProjectDocuments(projectId);
        List<DocumentDTO> documentDTOs = documentMapper.toDtoList(documents);
        return ResponseEntity.ok(documentDTOs);
    }

    /**
     * GET /api/folders/{id}/documents : Get all documents for a folder.
     *
     * @param folderId The folder ID
     * @return List of documents
     */
    @GetMapping("/folders/{folderId}/documents")
    @Operation(
        summary = "Get all documents for a folder",
        description = "Get all documents for a specified folder",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = DocumentDTO.class))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Folder not found")
        }
    )
    public ResponseEntity<List<DocumentDTO>> getFolderDocuments(@PathVariable Long folderId) {
        List<Document> documents = documentService.getFolderDocuments(folderId);
        List<DocumentDTO> documentDTOs = documentMapper.toDtoList(documents);
        return ResponseEntity.ok(documentDTOs);
    }

    /**
     * GET /api/documents/{id} : Get a document by ID.
     *
     * @param id The document ID
     * @return The document
     */
    @GetMapping("/documents/{id}")
    @Operation(
        summary = "Get a document by ID",
        description = "Get a document by its ID",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = DocumentDTO.class))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Document not found")
        }
    )
    public ResponseEntity<DocumentDTO> getDocumentById(@PathVariable Long id) {
        Document document = documentService.getDocumentById(id);
        DocumentDTO documentDTO = documentMapper.toDto(document);
        return ResponseEntity.ok(documentDTO);
    }
} 