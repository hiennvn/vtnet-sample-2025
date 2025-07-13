package com.vtnet.pdms.domain.service;

import com.vtnet.pdms.application.dto.UserCreateDTO;
import com.vtnet.pdms.application.dto.UserResponseDTO;
import com.vtnet.pdms.application.dto.UserUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for user management operations.
 */
public interface UserService {

    /**
     * Creates a new user.
     *
     * @param userDto Data for creating the user
     * @return The created user data
     */
    UserResponseDTO createUser(UserCreateDTO userDto);

    /**
     * Updates an existing user.
     *
     * @param id      The ID of the user to update
     * @param userDto Data for updating the user
     * @return The updated user data
     */
    UserResponseDTO updateUser(Long id, UserUpdateDTO userDto);

    /**
     * Deletes a user by ID.
     *
     * @param id The ID of the user to delete
     */
    void deleteUser(Long id);

    /**
     * Retrieves a user by ID.
     *
     * @param id The ID of the user to retrieve
     * @return The user data
     */
    UserResponseDTO getUserById(Long id);

    /**
     * Retrieves all users with pagination.
     *
     * @param pageable Pagination information
     * @return Page of users
     */
    Page<UserResponseDTO> getAllUsers(Pageable pageable);

    /**
     * Searches users by query term.
     *
     * @param query    The search query
     * @param pageable Pagination information
     * @return Page of matching users
     */
    Page<UserResponseDTO> searchUsers(String query, Pageable pageable);

    /**
     * Checks if a user with the given email exists.
     *
     * @param email The email to check
     * @return true if a user with the email exists, false otherwise
     */
    boolean existsByEmail(String email);
} 