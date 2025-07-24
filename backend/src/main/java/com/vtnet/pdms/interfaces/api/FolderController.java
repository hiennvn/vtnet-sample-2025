package com.vtnet.pdms.interfaces.api;

import com.vtnet.pdms.application.dto.FolderDTO;
import com.vtnet.pdms.application.dto.FolderCreateDTO;
import com.vtnet.pdms.application.mapper.FolderMapper;
import com.vtnet.pdms.domain.model.Folder;
import com.vtnet.pdms.domain.service.FolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing folders.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Folder", description = "Folder management APIs")
@SecurityRequirement(name = "bearerAuth")
public class FolderController {

    private final FolderService folderService;
    private final FolderMapper folderMapper;

    /**
     * Constructor with dependency injection.
     *
     * @param folderService Service for folder operations
     * @param folderMapper Mapper for folder entity-DTO conversion
     */
    @Autowired
    public FolderController(FolderService folderService, FolderMapper folderMapper) {
        this.folderService = folderService;
        this.folderMapper = folderMapper;
    }

    /**
     * GET /api/projects/{id}/folders : Get all root folders for a project.
     *
     * @param projectId The project ID
     * @return List of root folders
     */
    @GetMapping("/projects/{projectId}/folders")
    @Operation(
        summary = "Get all root folders for a project",
        description = "Get all root folders (folders with no parent) for a project",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = FolderDTO.class))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Project not found")
        }
    )
    public ResponseEntity<List<FolderDTO>> getProjectRootFolders(@PathVariable Long projectId) {
        List<Folder> folders = folderService.getProjectRootFolders(projectId);
        List<FolderDTO> folderDTOs = folderMapper.toDtoList(folders);
        return ResponseEntity.ok(folderDTOs);
    }

    /**
     * GET /api/folders/{id}/subfolders : Get all subfolders for a folder.
     *
     * @param folderId The folder ID
     * @return List of subfolders
     */
    @GetMapping("/folders/{folderId}/subfolders")
    @Operation(
        summary = "Get all subfolders for a folder",
        description = "Get all subfolders for a specified folder",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = FolderDTO.class))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Folder not found")
        }
    )
    public ResponseEntity<List<FolderDTO>> getSubfolders(@PathVariable Long folderId) {
        List<Folder> folders = folderService.getSubfolders(folderId);
        List<FolderDTO> folderDTOs = folderMapper.toDtoList(folders);
        return ResponseEntity.ok(folderDTOs);
    }

    /**
     * GET /api/folders/{id} : Get a folder by ID.
     *
     * @param id The folder ID
     * @return The folder
     */
    @GetMapping("/folders/{id}")
    @Operation(
        summary = "Get a folder by ID",
        description = "Get a folder by its ID",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = FolderDTO.class))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Folder not found")
        }
    )
    public ResponseEntity<FolderDTO> getFolderById(@PathVariable Long id) {
        Folder folder = folderService.getFolderById(id);
        FolderDTO folderDTO = folderMapper.toDto(folder);
        return ResponseEntity.ok(folderDTO);
    }

    /**
     * POST /api/folders : Create a new folder.
     *
     * @param folderCreateDTO The folder creation data
     * @return The created folder
     */
    @PostMapping("/folders")
    @Operation(
        summary = "Create a new folder",
        description = "Create a new folder in a project or as a subfolder",
        responses = {
            @ApiResponse(
                responseCode = "201",
                description = "Folder created successfully",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = FolderDTO.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires Project Manager role"),
            @ApiResponse(responseCode = "404", description = "Project or parent folder not found")
        }
    )
    public ResponseEntity<FolderDTO> createFolder(@Valid @RequestBody FolderCreateDTO folderCreateDTO) {
        Folder folder = folderService.createFolder(
            folderCreateDTO.getProjectId(),
            folderCreateDTO.getParentFolderId(),
            folderCreateDTO.getName()
        );
        FolderDTO folderDTO = folderMapper.toDto(folder);
        return ResponseEntity.status(HttpStatus.CREATED).body(folderDTO);
    }

    /**
     * DELETE /api/folders/{id} : Delete a folder by ID.
     *
     * @param id The folder ID
     * @return No content
     */
    @DeleteMapping("/folders/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
        summary = "Delete a folder by ID",
        description = "Delete a folder by its ID. The folder must be empty. Requires PROJECT_MANAGER role.",
        responses = {
            @ApiResponse(responseCode = "204", description = "Folder deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Bad request - folder is not empty"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires PROJECT_MANAGER role"),
            @ApiResponse(responseCode = "404", description = "Folder not found")
        }
    )
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        try {
            folderService.deleteFolder(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            // Return 400 Bad Request if folder is not empty
            throw new IllegalArgumentException(e.getMessage());
        }
    }
} 