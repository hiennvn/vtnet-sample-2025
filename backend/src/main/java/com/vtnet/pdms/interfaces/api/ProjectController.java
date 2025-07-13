package com.vtnet.pdms.interfaces.api;

import com.vtnet.pdms.application.dto.ProjectListDTO;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing projects.
 */
@RestController
@RequestMapping("/projects")
@Tag(name = "Project", description = "Project management APIs")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    /**
     * Constructor with dependency injection.
     *
     * @param projectService Service for project operations
     */
    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    /**
     * GET /projects : Get all projects with pagination.
     *
     * @param pageable Pagination information
     * @param status Optional status filter
     * @param name Optional name search term
     * @return Page of projects
     */
    @GetMapping
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
} 