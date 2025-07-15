package com.vtnet.pdms.application.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Folder entity.
 */
public class FolderDTO {
    private Long id;
    private Long projectId;
    private Long parentFolderId;
    private String name;
    private LocalDateTime createdAt;
    private UserResponseDTO createdBy;
    private Integer displayOrder;
    private Boolean hasSubfolders;

    // Constructors
    public FolderDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public UserResponseDTO getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserResponseDTO createdBy) {
        this.createdBy = createdBy;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getHasSubfolders() {
        return hasSubfolders;
    }

    public void setHasSubfolders(Boolean hasSubfolders) {
        this.hasSubfolders = hasSubfolders;
    }
} 