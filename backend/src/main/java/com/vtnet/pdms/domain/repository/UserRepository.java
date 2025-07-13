package com.vtnet.pdms.domain.repository;

import com.vtnet.pdms.domain.model.Role;
import com.vtnet.pdms.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by email.
     *
     * @param email The email to search for
     * @return An Optional containing the user if found, or empty if not found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user with the given email exists.
     *
     * @param email The email to check
     * @return true if a user with the email exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Find users by role.
     *
     * @param role The role to search for
     * @return List of users with the specified role
     */
    List<User> findByRolesContaining(Role role);

    /**
     * Find users by name or email containing the search term.
     *
     * @param name  The name search term
     * @param email The email search term
     * @param pageable Pagination information
     * @return Page of users matching the search criteria
     */
    Page<User> findByNameContainingOrEmailContaining(String name, String email, Pageable pageable);

    /**
     * Find users not in the specified list of IDs.
     *
     * @param userIds List of user IDs to exclude
     * @return List of users not in the specified list
     */
    List<User> findByIdNotIn(List<Long> userIds);

    /**
     * Search users by name or email with a single search term.
     *
     * @param searchTerm The search term to match against name or email
     * @param pageable Pagination information
     * @return Page of users matching the search criteria
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> searchByNameOrEmail(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find users available for assignment to a project.
     * This excludes users already in the project.
     *
     * @param projectId The project ID
     * @param pageable Pagination information
     * @return Page of users not assigned to the specified project
     */
    @Query("SELECT u FROM User u WHERE u.id NOT IN (SELECT pm.id.user.id FROM ProjectMember pm WHERE pm.id.project.id = :projectId)")
    Page<User> findUsersNotInProject(@Param("projectId") Long projectId, Pageable pageable);
} 