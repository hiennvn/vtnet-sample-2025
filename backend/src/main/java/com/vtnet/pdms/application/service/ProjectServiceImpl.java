package com.vtnet.pdms.application.service;

import com.vtnet.pdms.application.dto.ProjectListDTO;
import com.vtnet.pdms.application.mapper.ProjectMapper;
import com.vtnet.pdms.domain.model.Project;
import com.vtnet.pdms.domain.repository.ProjectRepository;
import com.vtnet.pdms.domain.service.ProjectService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementation of the ProjectService interface.
 */
@Service
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private static final Logger logger = LoggerFactory.getLogger(ProjectServiceImpl.class);

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    /**
     * Constructor with dependency injection.
     *
     * @param projectRepository Repository for project operations
     * @param projectMapper     Mapper for project entity-DTO conversion
     */
    @Autowired
    public ProjectServiceImpl(ProjectRepository projectRepository, ProjectMapper projectMapper) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_ADMIN')")
    @Transactional(readOnly = true)
    public Page<ProjectListDTO> getAllProjects(Pageable pageable) {
        logger.info("Retrieving all projects with pagination");
        Page<Project> projectPage = projectRepository.findAll(pageable);
        
        // Get document counts for projects
        List<Long> projectIds = projectPage.getContent().stream()
                .map(Project::getId)
                .collect(Collectors.toList());
        Map<Long, Integer> documentCounts = getDocumentCountsByProjectIds(projectIds);
        
        return projectMapper.toListDtoPage(projectPage, documentCounts);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_ADMIN')")
    @Transactional(readOnly = true)
    public Page<ProjectListDTO> getProjectsByStatus(String status, Pageable pageable) {
        logger.info("Retrieving projects with status: {} and pagination", status);
        Page<Project> projectPage = projectRepository.findByStatus(status, pageable);
        
        // Get document counts for projects
        List<Long> projectIds = projectPage.getContent().stream()
                .map(Project::getId)
                .collect(Collectors.toList());
        Map<Long, Integer> documentCounts = getDocumentCountsByProjectIds(projectIds);
        
        return projectMapper.toListDtoPage(projectPage, documentCounts);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_ADMIN')")
    @Transactional(readOnly = true)
    public Page<ProjectListDTO> getProjectsByNameContaining(String name, Pageable pageable) {
        logger.info("Retrieving projects with name containing: {} and pagination", name);
        Page<Project> projectPage = projectRepository.findByNameContaining(name, pageable);
        
        // Get document counts for projects
        List<Long> projectIds = projectPage.getContent().stream()
                .map(Project::getId)
                .collect(Collectors.toList());
        Map<Long, Integer> documentCounts = getDocumentCountsByProjectIds(projectIds);
        
        return projectMapper.toListDtoPage(projectPage, documentCounts);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public Map<Long, Integer> getDocumentCountsByProjectIds(List<Long> projectIds) {
        // In a real implementation, this would query the documents table to get counts
        // For now, we'll return mock data since we're using TDD and focusing on structure
        
        logger.info("Calculating document counts for {} projects", projectIds.size());
        
        // Mock implementation - in real code, this would query the database
        Map<Long, Integer> documentCounts = new HashMap<>();
        for (Long projectId : projectIds) {
            // Simulate random document counts between 0 and 20
            documentCounts.put(projectId, (int) (Math.random() * 20));
        }
        
        return documentCounts;
    }
} 