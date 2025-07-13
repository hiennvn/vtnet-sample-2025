package com.vtnet.pdms.domain.service;

import com.vtnet.pdms.application.dto.ProjectListDTO;
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
} 