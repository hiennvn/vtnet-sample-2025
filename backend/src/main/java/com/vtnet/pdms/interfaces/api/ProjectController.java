package com.vtnet.pdms.interfaces.api;

import com.vtnet.pdms.application.dto.ProjectCreateDTO;
import com.vtnet.pdms.application.dto.ProjectListDTO;
import com.vtnet.pdms.application.dto.ProjectUpdateDTO;
import com.vtnet.pdms.application.mapper.ProjectMapper;
import com.vtnet.pdms.domain.model.Project;
import com.vtnet.pdms.domain.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;

/**
 * REST controller for managing projects.
 */
@RestController
@RequestMapping("/projects")
@Tag(name = "Project", description = "Project management APIs")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectMapper projectMapper;

    /**
     * Constructor with dependency injection.
     *
     * @param projectService Service for project operations
     * @param projectMapper Mapper for project entity-DTO conversion
     */
    @Autowired
    public ProjectController(ProjectService projectService, ProjectMapper projectMapper) {
        this.projectService = projectService;
        this.projectMapper = projectMapper;
    }

    /**
     * GET /api/projects : Get all projects with pagination.
     *
     * @param pageable Pagination information
     * @param status Optional status filter
     * @param name Optional name search term
     * @return Page of projects
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_ADMIN')")
    @Operation(
        summary = "Get all projects",
        description = "Get all projects with pagination and optional filtering by status or name",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
        }
    )
    public ResponseEntity<Page<ProjectListDTO>> getAllProjects(
            @PageableDefault(size = 10) Pageable pageable,
            @Parameter(description = "Filter by status") @RequestParam(required = false) String status,
            @Parameter(description = "Filter by name") @RequestParam(required = false) String name) {
        
        Page<ProjectListDTO> projects;
        
        if (status != null && !status.isEmpty()) {
            projects = projectService.getProjectsByStatus(status, pageable);
        } else if (name != null && !name.isEmpty()) {
            projects = projectService.getProjectsByNameContaining(name, pageable);
        } else {
            projects = projectService.getAllProjects(pageable);
        }
        
        return ResponseEntity.ok(projects);
    }
    
    /**
     * POST /api/projects : Create a new project.
     *
     * @param projectCreateDTO The project to create
     * @return The created project
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(
        summary = "Create a new project",
        description = "Create a new project with the provided information",
        responses = {
            @ApiResponse(
                responseCode = "201",
                description = "Project created successfully",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectListDTO.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
        }
    )
    public ResponseEntity<ProjectListDTO> createProject(@Valid @RequestBody ProjectCreateDTO projectCreateDTO) {
        Project project = projectService.createProject(projectCreateDTO);
        ProjectListDTO projectDTO = projectMapper.toListDto(project);
        
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(projectDTO);
    }
    
    /**
     * PUT /api/projects/{id} : Update an existing project.
     *
     * @param id The ID of the project to update
     * @param projectUpdateDTO The updated project data
     * @return The updated project
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    @Operation(
        summary = "Update an existing project",
        description = "Update an existing project with the provided information",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Project updated successfully",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectListDTO.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Project not found")
        }
    )
    public ResponseEntity<ProjectListDTO> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectUpdateDTO projectUpdateDTO) {
        
        Project updatedProject = projectService.updateProject(id, projectUpdateDTO);
        ProjectListDTO projectDTO = projectMapper.toListDto(updatedProject);
        
        return ResponseEntity.ok(projectDTO);
    }

    /**
     * GET /projects/{id} : Get a project by ID.
     *
     * @param id The ID of the project to retrieve
     * @return The project
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    @Operation(
        summary = "Get a project by ID",
        description = "Get a project by its ID",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectListDTO.class))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Project not found")
        }
    )
    public ResponseEntity<ProjectListDTO> getProjectById(@PathVariable Long id) {
        Project project = projectService.getProjectById(id);
        ProjectListDTO projectDTO = projectMapper.toListDto(project);
        return ResponseEntity.ok(projectDTO);
    }
    
    /**
     * DELETE /projects/{id} : Delete a project by ID.
     *
     * @param id The ID of the project to delete
     * @return No content
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_ADMIN')")
    @Operation(
        summary = "Delete a project",
        description = "Delete a project by its ID. This will also delete all related data such as project members and documents.",
        responses = {
            @ApiResponse(responseCode = "204", description = "Project deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Project not found")
        }
    )
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
} 