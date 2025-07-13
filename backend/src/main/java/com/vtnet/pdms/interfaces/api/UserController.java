package com.vtnet.pdms.interfaces.api;

import com.vtnet.pdms.application.dto.UserCreateDTO;
import com.vtnet.pdms.application.dto.UserResponseDTO;
import com.vtnet.pdms.application.dto.UserUpdateDTO;
import com.vtnet.pdms.domain.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for user management operations.
 */
@RestController
@RequestMapping("/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    /**
     * Constructor with dependency injection.
     *
     * @param userService Service for user operations
     */
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Creates a new user.
     *
     * @param userDto Data for creating the user
     * @return The created user data with 201 Created status
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserCreateDTO userDto) {
        logger.info("REST request to create user: {}", userDto.getEmail());
        UserResponseDTO createdUser = userService.createUser(userDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    /**
     * Retrieves all users with pagination.
     *
     * @param pageable Pagination information
     * @return Page of users
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        logger.info("REST request to get all users");
        Page<UserResponseDTO> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Retrieves a user by ID.
     *
     * @param id The ID of the user to retrieve
     * @return The user data
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('DIRECTOR') or @securityUtils.isCurrentUser(#id)")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        logger.info("REST request to get user: {}", id);
        UserResponseDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Updates an existing user.
     *
     * @param id      The ID of the user to update
     * @param userDto Data for updating the user
     * @return The updated user data
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('DIRECTOR') or @securityUtils.isCurrentUser(#id)")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable Long id, 
            @Valid @RequestBody UserUpdateDTO userDto) {
        logger.info("REST request to update user: {}", id);
        UserResponseDTO updatedUser = userService.updateUser(id, userDto);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Deletes a user by ID.
     *
     * @param id The ID of the user to delete
     * @return Empty response with 204 No Content status
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('DIRECTOR')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        logger.info("REST request to delete user: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Searches users by query term.
     *
     * @param query    The search query
     * @param pageable Pagination information
     * @return Page of matching users
     */
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('DIRECTOR')")
    public ResponseEntity<Page<UserResponseDTO>> searchUsers(
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        logger.info("REST request to search users with query: {}", query);
        Page<UserResponseDTO> users = userService.searchUsers(query, pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Checks if a user with the given email exists.
     *
     * @param email The email to check
     * @return true if a user with the email exists, false otherwise
     */
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        logger.info("REST request to check if email exists: {}", email);
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }
} 