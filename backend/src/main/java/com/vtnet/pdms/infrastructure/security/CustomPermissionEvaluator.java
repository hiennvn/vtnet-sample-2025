package com.vtnet.pdms.infrastructure.security;

import com.vtnet.pdms.domain.model.Document;
import com.vtnet.pdms.domain.model.Folder;
import com.vtnet.pdms.domain.model.Project;
import com.vtnet.pdms.domain.model.User;
import com.vtnet.pdms.domain.repository.DocumentRepository;
import com.vtnet.pdms.domain.repository.FolderRepository;
import com.vtnet.pdms.domain.repository.ProjectRepository;
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
    private final ProjectRepository projectRepository;
    private final FolderRepository folderRepository;
    private final DocumentRepository documentRepository;
    private final SecurityUtils securityUtils;

    /**
     * Constructor with dependency injection.
     *
     * @param userRepository Repository for user operations
     * @param projectRepository Repository for project operations
     * @param folderRepository Repository for folder operations
     * @param documentRepository Repository for document operations
     * @param securityUtils Security utilities
     */
    @Autowired
    public CustomPermissionEvaluator(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            FolderRepository folderRepository,
            DocumentRepository documentRepository,
            SecurityUtils securityUtils) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.folderRepository = folderRepository;
        this.documentRepository = documentRepository;
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
        
        // Check permissions for Project objects
        if (targetDomainObject instanceof Project) {
            Project targetProject = (Project) targetDomainObject;
            return hasProjectPermission(authentication, targetProject, permissionString);
        }
        
        // Check permissions for Folder objects
        if (targetDomainObject instanceof Folder) {
            Folder targetFolder = (Folder) targetDomainObject;
            return hasFolderPermission(authentication, targetFolder, permissionString);
        }
        
        // Check permissions for Document objects
        if (targetDomainObject instanceof Document) {
            Document targetDocument = (Document) targetDomainObject;
            return hasDocumentPermission(authentication, targetDocument, permissionString);
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
        
        // Check permissions for Project objects
        if ("Project".equals(targetType)) {
            Long projectId = (Long) targetId;
            Optional<Project> optionalProject = projectRepository.findById(projectId);
            return optionalProject.map(project -> hasProjectPermission(authentication, project, permissionString)).orElse(false);
        }
        
        // Check permissions for Folder objects
        if ("Folder".equals(targetType)) {
            Long folderId = (Long) targetId;
            Optional<Folder> optionalFolder = folderRepository.findById(folderId);
            return optionalFolder.map(folder -> hasFolderPermission(authentication, folder, permissionString)).orElse(false);
        }
        
        // Check permissions for Document objects
        if ("Document".equals(targetType)) {
            Long documentId = (Long) targetId;
            Optional<Document> optionalDocument = documentRepository.findById(documentId);
            return optionalDocument.map(document -> hasDocumentPermission(authentication, document, permissionString)).orElse(false);
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
        if (securityUtils.hasRole("ROLE_ADMIN")) {
            return true;
        }

        // Users can view and edit their own profiles
        if (("read".equals(permission) || "write".equals(permission)) && 
            securityUtils.isCurrentUser(targetUser.getId())) {
            return true;
        }

        // Project managers can view team members
        if ("read".equals(permission) && securityUtils.hasRole("ROLE_PROJECT_MANAGER")) {
            // Additional logic for project-specific permissions could be added here
            return true;
        }

        return false;
    }
    
    /**
     * Checks if the authentication has permission on the target project.
     *
     * @param authentication The current authentication
     * @param targetProject The project to check permissions for
     * @param permission The permission to check
     * @return true if permission is granted, false otherwise
     */
    private boolean hasProjectPermission(Authentication authentication, Project targetProject, String permission) {
        // Admins and Directors can do anything
        if (securityUtils.hasRole("ROLE_ADMIN") || securityUtils.hasRole("ROLE_DIRECTOR")) {
            return true;
        }
        
        // Check if user is a member of the project
        User currentUser = securityUtils.getCurrentUser();

        if (currentUser != null) {
            boolean isMember = targetProject.getMembers().stream()
                    .anyMatch(member -> member.getUser().getId().equals(currentUser.getId()));
            
            if (isMember) {
                // Project managers can read and write
                if (securityUtils.hasRole("ROLE_PROJECT_MANAGER")) {
                    return true;
                }
                
                // Team members can only read
                if ("read".equals(permission) && securityUtils.hasRole("ROLE_MEMBER")) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Checks if the authentication has permission on the target folder.
     *
     * @param authentication The current authentication
     * @param targetFolder The folder to check permissions for
     * @param permission The permission to check
     * @return true if permission is granted, false otherwise
     */
    private boolean hasFolderPermission(Authentication authentication, Folder targetFolder, String permission) {
        // Delegate to project permission check
        return hasProjectPermission(authentication, targetFolder.getProject(), permission) || securityUtils.hasRole("ROLE_ADMIN");
    }
    
    /**
     * Checks if the authentication has permission on the target document.
     *
     * @param authentication The current authentication
     * @param targetDocument The document to check permissions for
     * @param permission The permission to check
     * @return true if permission is granted, false otherwise
     */
    private boolean hasDocumentPermission(Authentication authentication, Document targetDocument, String permission) {
        // Delegate to folder permission check
        return hasFolderPermission(authentication, targetDocument.getFolder(), permission) || securityUtils.hasRole("ROLE_ADMIN");
    }
    
    /**
     * Checks if the current user has access to a project by ID.
     *
     * @param projectId The project ID
     * @return true if the user has access, false otherwise
     */
    public boolean hasProjectAccess(Long projectId) {
        Optional<Project> optionalProject = projectRepository.findById(projectId);
        if (optionalProject.isEmpty()) {
            return false;
        }
        return hasProjectPermission(securityUtils.getAuthentication(), optionalProject.get(), "read");
    }
    
    /**
     * Checks if the current user has access to a folder by ID.
     *
     * @param folderId The folder ID
     * @return true if the user has access, false otherwise
     */
    public boolean hasFolderAccess(Long folderId) {
        Optional<Folder> optionalFolder = folderRepository.findById(folderId);
        if (optionalFolder.isEmpty()) {
            return false;
        }
        return hasFolderPermission(securityUtils.getAuthentication(), optionalFolder.get(), "read");
    }
    
    /**
     * Checks if the current user has access to a document by ID.
     *
     * @param documentId The document ID
     * @return true if the user has access, false otherwise
     */
    public boolean hasDocumentAccess(Long documentId) {
        Optional<Document> optionalDocument = documentRepository.findById(documentId);
        if (optionalDocument.isEmpty()) {
            return false;
        }
        return hasDocumentPermission(securityUtils.getAuthentication(), optionalDocument.get(), "read");
    }
} 