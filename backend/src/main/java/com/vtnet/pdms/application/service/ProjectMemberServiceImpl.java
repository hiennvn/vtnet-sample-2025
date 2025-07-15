package com.vtnet.pdms.application.service;

import com.vtnet.pdms.application.dto.ProjectMemberCreateDTO;
import com.vtnet.pdms.application.dto.ProjectMemberDTO;
import com.vtnet.pdms.application.dto.ProjectMemberUpdateDTO;
import com.vtnet.pdms.application.mapper.ProjectMemberMapper;
import com.vtnet.pdms.domain.model.Project;
import com.vtnet.pdms.domain.model.ProjectMember;
import com.vtnet.pdms.domain.model.User;
import com.vtnet.pdms.domain.repository.ProjectMemberRepository;
import com.vtnet.pdms.domain.repository.ProjectRepository;
import com.vtnet.pdms.domain.repository.UserRepository;
import com.vtnet.pdms.domain.service.ProjectMemberService;
import com.vtnet.pdms.infrastructure.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of the ProjectMemberService interface.
 */
@Service
@Transactional
public class ProjectMemberServiceImpl implements ProjectMemberService {

    private static final Logger logger = LoggerFactory.getLogger(ProjectMemberServiceImpl.class);

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectMemberMapper projectMemberMapper;

    /**
     * Constructor with dependency injection.
     *
     * @param projectRepository Repository for project operations
     * @param userRepository Repository for user operations
     * @param projectMemberRepository Repository for project member operations
     * @param projectMemberMapper Mapper for project member entity-DTO conversion
     */
    @Autowired
    public ProjectMemberServiceImpl(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            ProjectMemberRepository projectMemberRepository,
            ProjectMemberMapper projectMemberMapper) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.projectMemberMapper = projectMemberMapper;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    @Transactional(readOnly = true)
    public List<ProjectMemberDTO> getProjectMembers(Long projectId) {
        logger.info("Retrieving members for project with ID: {}", projectId);
        
        // Check if project exists
        projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + projectId));
        
        // Get project members
        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        
        return projectMemberMapper.toDtoList(members);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    public ProjectMemberDTO addProjectMember(Long projectId, ProjectMemberCreateDTO memberCreateDTO) {
        logger.info("Adding member to project with ID: {}", projectId);
        
        // Get current user
        String username = SecurityUtils.getCurrentUserLogin()
                .orElseThrow(() -> new IllegalStateException("Current user login not found"));
        
        User currentUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalStateException("Current user not found: " + username));
        
        // Get project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + projectId));
        
        // Get user to add
        User userToAdd = userRepository.findById(memberCreateDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + memberCreateDTO.getUserId()));
        
        // Check if user is already a member
        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, userToAdd.getId())) {
            throw new IllegalArgumentException("User is already a member of this project");
        }
        
        // Add member
        ProjectMember member = project.addMember(userToAdd, memberCreateDTO.getRole(), currentUser);
        // Removed explicit save call as it's already cascaded from the Project entity
        
        // Save the project to persist the changes to the members collection
        projectRepository.save(project);
        
        return projectMemberMapper.toDto(member);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    public ProjectMemberDTO updateProjectMember(Long projectId, Long userId, ProjectMemberUpdateDTO memberUpdateDTO) {
        logger.info("Updating member role for user ID: {} in project ID: {}", userId, projectId);
        
        // Get project member
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("User is not a member of this project"));
        
        // Check if this is the last project manager
        if ("PROJECT_MANAGER".equals(member.getRole()) && 
            !memberUpdateDTO.getRole().equals("PROJECT_MANAGER") && 
            projectMemberRepository.countByProjectIdAndRole(projectId, "PROJECT_MANAGER") <= 1) {
            throw new IllegalArgumentException("Cannot remove the last project manager");
        }
        
        // Update role
        member.setRole(memberUpdateDTO.getRole());
        projectMemberRepository.save(member);
        
        return projectMemberMapper.toDto(member);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    public void removeProjectMember(Long projectId, Long userId) {
        logger.info("Removing member with user ID: {} from project ID: {}", userId, projectId);
        
        // Get project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + projectId));
        
        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        // Check if user is a member
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("User is not a member of this project"));
        
        // Check if this is the last project manager
        if ("PROJECT_MANAGER".equals(member.getRole()) && 
            projectMemberRepository.countByProjectIdAndRole(projectId, "PROJECT_MANAGER") <= 1) {
            throw new IllegalArgumentException("Cannot remove the last project manager");
        }
        
        // Remove member
        project.removeMember(user);
        projectMemberRepository.delete(member);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    @Transactional(readOnly = true)
    public List<User> getUsersNotInProject(Long projectId) {
        logger.info("Retrieving users not in project with ID: {}", projectId);
        
        // Check if project exists
        projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + projectId));
        
        return projectMemberRepository.findUsersNotInProject(projectId);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public boolean isUserProjectMember(Long projectId, Long userId) {
        return projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public boolean hasUserProjectRole(Long projectId, Long userId, String role) {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId).orElse(null);
        return member != null && role.equals(member.getRole());
    }
} 