package com.vtnet.pdms.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for creating a new folder.
 */
public class FolderCreateDTO {
    
    @NotBlank(message = "Folder name is required")
    @Size(max = 255, message = "Folder name cannot exceed 255 characters")
    private String name;
    
    @NotNull(message = "Project ID is required")
    private Long projectId;
    
    private Long parentFolderId;

    // Constructors
    public FolderCreateDTO() {
    }

    public FolderCreateDTO(String name, Long projectId, Long parentFolderId) {
        this.name = name;
        this.projectId = projectId;
        this.parentFolderId = parentFolderId;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getParentFolderId() {
        return parentFolderId;
    }

    public void setParentFolderId(Long parentFolderId) {
        this.parentFolderId = parentFolderId;
    }
} 