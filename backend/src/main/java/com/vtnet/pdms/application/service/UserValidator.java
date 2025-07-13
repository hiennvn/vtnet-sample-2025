package com.vtnet.pdms.application.service;

import com.vtnet.pdms.application.dto.UserCreateDTO;
import com.vtnet.pdms.application.dto.UserUpdateDTO;
import com.vtnet.pdms.domain.repository.UserRepository;
import com.vtnet.pdms.infrastructure.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Validator for user-related operations.
 */
@Component
public class UserValidator {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$"
    );

    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    /**
     * Constructor with dependency injection.
     *
     * @param userRepository Repository for user operations
     * @param securityUtils  Security utilities
     */
    @Autowired
    public UserValidator(UserRepository userRepository, SecurityUtils securityUtils) {
        this.userRepository = userRepository;
        this.securityUtils = securityUtils;
    }

    /**
     * Validates a user creation request.
     *
     * @param userDto The user creation DTO to validate
     * @throws IllegalArgumentException if validation fails
     */
    public void validateForCreation(UserCreateDTO userDto) {
        validateEmail(userDto.getEmail());
        validatePassword(userDto.getPassword());
        validateName(userDto.getName());
        validateEmailUniqueness(userDto.getEmail());
    }

    /**
     * Validates a user update request.
     *
     * @param id      The ID of the user to update
     * @param userDto The user update DTO to validate
     * @throws IllegalArgumentException if validation fails
     */
    public void validateForUpdate(Long id, UserUpdateDTO userDto) {
        validateEmail(userDto.getEmail());
        validateName(userDto.getName());

        // Validate password if provided
        if (userDto.isPasswordChangeRequested()) {
            validatePassword(userDto.getPassword());
        }

        // Check if email is already taken by another user
        if (userRepository.existsByEmail(userDto.getEmail())) {
            userRepository.findByEmail(userDto.getEmail())
                    .ifPresent(user -> {
                        if (!user.getId().equals(id)) {
                            throw new IllegalArgumentException("Email already in use: " + userDto.getEmail());
                        }
                    });
        }

        // Prevent self-deletion of DIRECTOR role
        if (securityUtils.isCurrentUser(id) && userDto.getRoleIds() != null) {
            // Logic to prevent removing DIRECTOR role from self would go here
        }
    }

    /**
     * Validates an email address.
     *
     * @param email The email to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }

        if (email.length() > 255) {
            throw new IllegalArgumentException("Email cannot exceed 255 characters");
        }
    }

    /**
     * Validates a password.
     *
     * @param password The password to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }

        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException(
                    "Password must contain at least one digit, one lowercase letter, " +
                            "one uppercase letter, one special character, and no whitespace"
            );
        }
    }

    /**
     * Validates a name.
     *
     * @param name The name to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (name.length() > 255) {
            throw new IllegalArgumentException("Name cannot exceed 255 characters");
        }
    }

    /**
     * Validates that an email is unique.
     *
     * @param email The email to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateEmailUniqueness(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use: " + email);
        }
    }
} 