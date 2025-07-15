package com.vtnet.pdms.application.service;

import com.vtnet.pdms.application.dto.ProjectCreateDTO;
import com.vtnet.pdms.application.dto.ProjectListDTO;
import com.vtnet.pdms.application.dto.ProjectUpdateDTO;
import com.vtnet.pdms.application.mapper.ProjectMapper;
import com.vtnet.pdms.domain.model.Project;
import com.vtnet.pdms.domain.model.User;
import com.vtnet.pdms.domain.repository.DocumentRepository;
import com.vtnet.pdms.domain.repository.ProjectMemberRepository;
import com.vtnet.pdms.domain.repository.ProjectRepository;
import com.vtnet.pdms.domain.repository.UserRepository;
import com.vtnet.pdms.domain.service.ProjectService;
import com.vtnet.pdms.infrastructure.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final DocumentRepository documentRepository;

    /**
     * Constructor with dependency injection.
     *
     * @param projectRepository Repository for project operations
     * @param projectMapper     Mapper for project entity-DTO conversion
     * @param userRepository    Repository for user operations
     * @param projectMemberRepository Repository for project member operations
     * @param documentRepository Repository for document operations
     */
    @Autowired
    public ProjectServiceImpl(ProjectRepository projectRepository, 
                             ProjectMapper projectMapper, 
                             UserRepository userRepository,
                             ProjectMemberRepository projectMemberRepository,
                             DocumentRepository documentRepository) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
        this.userRepository = userRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.documentRepository = documentRepository;
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
        logger.info("Calculating document counts for {} projects", projectIds.size());
        
        Map<Long, Integer> documentCounts = new HashMap<>();
        for (Long projectId : projectIds) {
            // Get actual document count from repository
            List<com.vtnet.pdms.domain.model.Document> documents = documentRepository.findByProjectId(projectId);
            documentCounts.put(projectId, documents.size());
        }
        
        return documentCounts;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_ADMIN')")
    public Project createProject(ProjectCreateDTO projectCreateDTO) {
        logger.info("Creating new project: {}", projectCreateDTO.getName());
        
        // Get current user
        String username = SecurityUtils.getCurrentUserLogin()
                .orElseThrow(() -> new IllegalStateException("Current user login not found"));
        
        User currentUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalStateException("Current user not found: " + username));
        
        // Create project entity from DTO
        Project project = projectMapper.toEntity(projectCreateDTO);
        
        // Set additional fields
        project.setStatus(Project.STATUS_ACTIVE);
        project.setCreatedBy(currentUser);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        
        // Save and return the project
        return projectRepository.save(project);
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    public Project updateProject(Long id, ProjectUpdateDTO projectUpdateDTO) {
        logger.info("Updating project with ID: {}", id);
        
        // Find the project
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + id));
        
        // Check if the user has permission to update this project
        // Directors can update any project, but Project Managers should only update their assigned projects
        if (!SecurityUtils.hasAuthority("ROLE_DIRECTOR")) {
            // For Project Managers, check if they are assigned to this project
            String username = SecurityUtils.getCurrentUserLogin()
                    .orElseThrow(() -> new IllegalStateException("Current user login not found"));
            
            boolean isProjectManager = project.getMembers().stream()
                    .anyMatch(member -> member.getUser().getEmail().equals(username) && 
                            "PROJECT_MANAGER".equals(member.getRole()));
            isProjectManager = isProjectManager || SecurityUtils.hasAuthority("ROLE_ADMIN");
            
            if (!isProjectManager) {
                throw new IllegalStateException("You don't have permission to update this project");
            }
        }
        
        // Update the project using the mapper
        projectMapper.updateEntityFromDto(project, projectUpdateDTO);
        
        // Update the updatedAt timestamp
        project.setUpdatedAt(LocalDateTime.now());
        
        // Save and return the updated project
        return projectRepository.save(project);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    @Transactional(readOnly = true)
    public Project getProjectById(Long id) {
        logger.info("Retrieving project with ID: {}", id);
        return projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + id));
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public void deleteProject(Long id) {
        logger.info("Deleting project with ID: {}", id);
        
        // Check if the user has Director role
        if (!SecurityUtils.hasAuthority("ROLE_DIRECTOR") && !SecurityUtils.hasAuthority("ROLE_ADMIN")) {
            throw new AccessDeniedException("Only directors can delete projects");
        }
        
        // Find the project
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + id));
        
        // Delete project members first to avoid foreign key constraints
        projectMemberRepository.deleteByProjectId(id);
        
        // Delete the project
        projectRepository.delete(project);
        
        logger.info("Project with ID: {} has been deleted", id);
    }
} 