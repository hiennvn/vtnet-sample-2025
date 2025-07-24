package com.vtnet.pdms.interfaces.api;

import com.vtnet.pdms.application.dto.DocumentDTO;
import com.vtnet.pdms.application.dto.DocumentUploadDTO;
import com.vtnet.pdms.application.mapper.DocumentMapper;
import com.vtnet.pdms.domain.model.Document;
import com.vtnet.pdms.domain.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    
    /**
     * POST /api/documents : Upload a new document.
     *
     * @param name The document name
     * @param projectId The project ID
     * @param folderId The folder ID (optional)
     * @param file The file to upload
     * @return The created document
     * @throws IOException If an I/O error occurs
     */
    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Upload a new document",
        description = "Upload a new document to a project folder. Requires PROJECT_MANAGER role.",
        responses = {
            @ApiResponse(
                responseCode = "201",
                description = "Document created",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = DocumentDTO.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires PROJECT_MANAGER role"),
            @ApiResponse(responseCode = "404", description = "Project or folder not found")
        }
    )
    public ResponseEntity<DocumentDTO> uploadDocument(
            @RequestParam("name") String name,
            @RequestParam("projectId") Long projectId,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        DocumentUploadDTO uploadDTO = new DocumentUploadDTO(name, projectId, folderId, file);
        Document document = documentService.uploadDocument(uploadDTO);
        DocumentDTO documentDTO = documentMapper.toDto(document);
        return ResponseEntity.status(HttpStatus.CREATED).body(documentDTO);
    }

    /**
     * DELETE /api/documents/{id} : Delete a document by ID.
     *
     * @param id The document ID
     * @return No content
     */
    @DeleteMapping("/documents/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
        summary = "Delete a document by ID",
        description = "Delete a document by its ID. Requires PROJECT_MANAGER role.",
        responses = {
            @ApiResponse(responseCode = "204", description = "Document deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires PROJECT_MANAGER role"),
            @ApiResponse(responseCode = "404", description = "Document not found")
        }
    )
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
} 