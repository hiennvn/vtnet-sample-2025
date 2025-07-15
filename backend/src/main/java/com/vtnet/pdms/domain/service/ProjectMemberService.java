package com.vtnet.pdms.domain.service;

import com.vtnet.pdms.application.dto.ProjectMemberCreateDTO;
import com.vtnet.pdms.application.dto.ProjectMemberDTO;
import com.vtnet.pdms.application.dto.ProjectMemberUpdateDTO;
import com.vtnet.pdms.domain.model.ProjectMember;
import com.vtnet.pdms.domain.model.User;

import java.util.List;

/**
 * Service interface for ProjectMember operations.
 */
public interface ProjectMemberService {

    /**
     * Get all members of a project.
     *
     * @param projectId The project ID
     * @return List of project members
     */
    List<ProjectMemberDTO> getProjectMembers(Long projectId);

    /**
     * Add a member to a project.
     *
     * @param projectId The project ID
     * @param memberCreateDTO The member data
     * @return The added project member
     */
    ProjectMemberDTO addProjectMember(Long projectId, ProjectMemberCreateDTO memberCreateDTO);

    /**
     * Update a project member's role.
     *
     * @param projectId The project ID
     * @param userId The user ID
     * @param memberUpdateDTO The updated member data
     * @return The updated project member
     */
    ProjectMemberDTO updateProjectMember(Long projectId, Long userId, ProjectMemberUpdateDTO memberUpdateDTO);

    /**
     * Remove a member from a project.
     *
     * @param projectId The project ID
     * @param userId The user ID
     */
    void removeProjectMember(Long projectId, Long userId);

    /**
     * Get users who are not members of a project.
     *
     * @param projectId The project ID
     * @return List of users not in the project
     */
    List<User> getUsersNotInProject(Long projectId);

    /**
     * Check if a user is a member of a project.
     *
     * @param projectId The project ID
     * @param userId The user ID
     * @return True if the user is a member of the project
     */
    boolean isUserProjectMember(Long projectId, Long userId);

    /**
     * Check if a user has a specific role in a project.
     *
     * @param projectId The project ID
     * @param userId The user ID
     * @param role The role to check
     * @return True if the user has the specified role in the project
     */
    boolean hasUserProjectRole(Long projectId, Long userId, String role);
} 