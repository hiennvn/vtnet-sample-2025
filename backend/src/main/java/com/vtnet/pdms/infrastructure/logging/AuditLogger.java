package com.vtnet.pdms.infrastructure.logging;

import com.vtnet.pdms.domain.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Logger for audit events in the system.
 */
@Component
public class AuditLogger {

    private static final Logger logger = LoggerFactory.getLogger("audit");

    /**
     * Logs a user creation event.
     *
     * @param user      The created user
     * @param createdBy The user who created the user
     */
    public void logUserCreated(User user, String createdBy) {
        logger.info("USER_CREATED: id={}, email={}, createdBy={}", 
                user.getId(), user.getEmail(), createdBy);
    }

    /**
     * Logs a user update event.
     *
     * @param user      The updated user
     * @param updatedBy The user who updated the user
     */
    public void logUserUpdated(User user, String updatedBy) {
        logger.info("USER_UPDATED: id={}, email={}, updatedBy={}", 
                user.getId(), user.getEmail(), updatedBy);
    }

    /**
     * Logs a user deletion event.
     *
     * @param userId    The ID of the deleted user
     * @param deletedBy The user who deleted the user
     */
    public void logUserDeleted(Long userId, String deletedBy) {
        logger.info("USER_DELETED: id={}, deletedBy={}", userId, deletedBy);
    }

    /**
     * Logs a role assignment event.
     *
     * @param userId     The ID of the user who received the role
     * @param roleName   The name of the assigned role
     * @param assignedBy The user who assigned the role
     */
    public void logRoleAssigned(Long userId, String roleName, String assignedBy) {
        logger.info("ROLE_ASSIGNED: userId={}, role={}, assignedBy={}", 
                userId, roleName, assignedBy);
    }

    /**
     * Logs a role removal event.
     *
     * @param userId    The ID of the user who lost the role
     * @param roleName  The name of the removed role
     * @param removedBy The user who removed the role
     */
    public void logRoleRemoved(Long userId, String roleName, String removedBy) {
        logger.info("ROLE_REMOVED: userId={}, role={}, removedBy={}", 
                userId, roleName, removedBy);
    }

    /**
     * Logs a login attempt.
     *
     * @param email     The email used for login
     * @param success   Whether the login was successful
     * @param ipAddress The IP address of the login attempt
     */
    public void logLoginAttempt(String email, boolean success, String ipAddress) {
        if (success) {
            logger.info("LOGIN_SUCCESS: email={}, ip={}", email, ipAddress);
        } else {
            logger.warn("LOGIN_FAILURE: email={}, ip={}", email, ipAddress);
        }
    }

    /**
     * Logs a password change event.
     *
     * @param userId The ID of the user whose password was changed
     * @param byUser Whether the user changed their own password
     */
    public void logPasswordChanged(Long userId, boolean byUser) {
        if (byUser) {
            logger.info("PASSWORD_CHANGED: userId={}, changedBySelf=true", userId);
        } else {
            logger.info("PASSWORD_CHANGED: userId={}, changedBySelf=false", userId);
        }
    }
} 