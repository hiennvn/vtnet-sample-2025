package com.vtnet.pdms.infrastructure.security;

import com.vtnet.pdms.domain.model.User;
import com.vtnet.pdms.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Optional;

/**
 * Custom permission evaluator for fine-grained access control.
 */
@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {

    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    /**
     * Constructor with dependency injection.
     *
     * @param userRepository Repository for user operations
     * @param securityUtils  Security utilities
     */
    @Autowired
    public CustomPermissionEvaluator(UserRepository userRepository, SecurityUtils securityUtils) {
        this.userRepository = userRepository;
        this.securityUtils = securityUtils;
    }

    /**
     * Evaluates if the current authentication has permission on the target object.
     *
     * @param authentication The current authentication
     * @param targetDomainObject The object to check permissions for
     * @param permission The permission to check
     * @return true if permission is granted, false otherwise
     */
    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null || targetDomainObject == null || !(permission instanceof String)) {
            return false;
        }

        String permissionString = (String) permission;

        // Check permissions for User objects
        if (targetDomainObject instanceof User) {
            User targetUser = (User) targetDomainObject;
            return hasUserPermission(authentication, targetUser, permissionString);
        }

        return false;
    }

    /**
     * Evaluates if the current authentication has permission on the target object identified by type and id.
     *
     * @param authentication The current authentication
     * @param targetId The ID of the target object
     * @param targetType The type of the target object
     * @param permission The permission to check
     * @return true if permission is granted, false otherwise
     */
    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        if (authentication == null || targetId == null || targetType == null || !(permission instanceof String)) {
            return false;
        }

        String permissionString = (String) permission;

        // Check permissions for User objects
        if ("User".equals(targetType)) {
            Long userId = (Long) targetId;
            Optional<User> optionalUser = userRepository.findById(userId);
            return optionalUser.map(user -> hasUserPermission(authentication, user, permissionString)).orElse(false);
        }

        return false;
    }

    /**
     * Checks if the authentication has permission on the target user.
     *
     * @param authentication The current authentication
     * @param targetUser The user to check permissions for
     * @param permission The permission to check
     * @return true if permission is granted, false otherwise
     */
    private boolean hasUserPermission(Authentication authentication, User targetUser, String permission) {
        // Directors can do anything
        if (securityUtils.hasRole("DIRECTOR")) {
            return true;
        }

        // Users can view and edit their own profiles
        if (("read".equals(permission) || "write".equals(permission)) && 
            securityUtils.isCurrentUser(targetUser.getId())) {
            return true;
        }

        // Project managers can view team members
        if ("read".equals(permission) && securityUtils.hasRole("PROJECT_MANAGER")) {
            // Additional logic for project-specific permissions could be added here
            return true;
        }

        return false;
    }
} 