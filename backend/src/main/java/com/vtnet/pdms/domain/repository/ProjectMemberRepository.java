package com.vtnet.pdms.domain.repository;

import com.vtnet.pdms.domain.model.ProjectMember;
import com.vtnet.pdms.domain.model.ProjectMember.ProjectMemberPK;
import com.vtnet.pdms.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ProjectMember entity operations.
 */
@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberPK> {

    /**
     * Find all members of a project.
     *
     * @param projectId The project ID
     * @return List of project members
     */
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.id.project.id = :projectId")
    List<ProjectMember> findByProjectId(@Param("projectId") Long projectId);

    /**
     * Find a specific member of a project.
     *
     * @param projectId The project ID
     * @param userId The user ID
     * @return Optional containing the project member if found
     */
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.id.project.id = :projectId AND pm.id.user.id = :userId")
    Optional<ProjectMember> findByProjectIdAndUserId(@Param("projectId") Long projectId, @Param("userId") Long userId);

    /**
     * Check if a user is a member of a project.
     *
     * @param projectId The project ID
     * @param userId The user ID
     * @return True if the user is a member of the project
     */
    @Query("SELECT COUNT(pm) > 0 FROM ProjectMember pm WHERE pm.id.project.id = :projectId AND pm.id.user.id = :userId")
    boolean existsByProjectIdAndUserId(@Param("projectId") Long projectId, @Param("userId") Long userId);

    /**
     * Find all users who are not members of a specific project.
     *
     * @param projectId The project ID
     * @return List of users who are not members of the project
     */
    @Query("SELECT u FROM User u WHERE u.id NOT IN (SELECT pm.id.user.id FROM ProjectMember pm WHERE pm.id.project.id = :projectId)")
    List<User> findUsersNotInProject(@Param("projectId") Long projectId);

    /**
     * Count the number of members with a specific role in a project.
     *
     * @param projectId The project ID
     * @param role The role to count
     * @return The number of members with the specified role
     */
    @Query("SELECT COUNT(pm) FROM ProjectMember pm WHERE pm.id.project.id = :projectId AND pm.role = :role")
    long countByProjectIdAndRole(@Param("projectId") Long projectId, @Param("role") String role);

    /**
     * Delete all members of a project.
     *
     * @param projectId The project ID
     */
    @Modifying
    @Query("DELETE FROM ProjectMember pm WHERE pm.id.project.id = :projectId")
    void deleteByProjectId(@Param("projectId") Long projectId);
} 