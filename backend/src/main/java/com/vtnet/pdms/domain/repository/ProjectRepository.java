package com.vtnet.pdms.domain.repository;

import com.vtnet.pdms.domain.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Project entity operations.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * Find projects by status.
     *
     * @param status The status to search for
     * @param pageable Pagination information
     * @return Page of projects with the specified status
     */
    Page<Project> findByStatus(String status, Pageable pageable);
    
    /**
     * Find projects by status.
     *
     * @param status The status to search for
     * @return List of projects with the specified status
     */
    List<Project> findByStatus(String status);
    
    /**
     * Find projects by name containing the search term.
     *
     * @param name The name search term
     * @param pageable Pagination information
     * @return Page of projects matching the search criteria
     */
    Page<Project> findByNameContaining(String name, Pageable pageable);
} 