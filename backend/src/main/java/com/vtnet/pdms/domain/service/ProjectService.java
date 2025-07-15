package com.vtnet.pdms.domain.service;

import com.vtnet.pdms.application.dto.ProjectCreateDTO;
import com.vtnet.pdms.application.dto.ProjectListDTO;
import com.vtnet.pdms.application.dto.ProjectUpdateDTO;
import com.vtnet.pdms.domain.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * Service interface for Project operations.
 */
public interface ProjectService {

    /**
     * Get all projects with pagination.
     *
     * @param pageable Pagination information
     * @return Page of projects
     */
    Page<ProjectListDTO> getAllProjects(Pageable pageable);

    /**
     * Get projects by status with pagination.
     *
     * @param status The status to filter by
     * @param pageable Pagination information
     * @return Page of projects with the specified status
     */
    Page<ProjectListDTO> getProjectsByStatus(String status, Pageable pageable);

    /**
     * Get projects by name containing the search term with pagination.
     *
     * @param name The name search term
     * @param pageable Pagination information
     * @return Page of projects matching the search criteria
     */
    Page<ProjectListDTO> getProjectsByNameContaining(String name, Pageable pageable);

    /**
     * Get document counts for a list of project IDs.
     *
     * @param projectIds List of project IDs
     * @return Map of project IDs to document counts
     */
    Map<Long, Integer> getDocumentCountsByProjectIds(List<Long> projectIds);
    
    /**
     * Get a project by ID.
     *
     * @param id The ID of the project to retrieve
     * @return The project with the specified ID
     */
    Project getProjectById(Long id);
    
    /**
     * Create a new project.
     *
     * @param projectCreateDTO The project data
     * @return The created project
     */
    Project createProject(ProjectCreateDTO projectCreateDTO);
    
    /**
     * Update an existing project.
     *
     * @param id The ID of the project to update
     * @param projectUpdateDTO The updated project data
     * @return The updated project
     */
    Project updateProject(Long id, ProjectUpdateDTO projectUpdateDTO);
    
    /**
     * Delete a project by ID.
     * This will also delete all related data such as project members and documents.
     *
     * @param id The ID of the project to delete
     */
    void deleteProject(Long id);
} 