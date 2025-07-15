package com.vtnet.pdms.application.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Document entity.
 */
public class DocumentDTO {
    private Long id;
    private Long folderId;
    private String name;
    private String mimeType;
    private Long size;
    private LocalDateTime createdAt;
    private UserResponseDTO createdBy;
    private Integer displayOrder;
    private Integer versionCount;
    private Integer latestVersionNumber;

    // Constructors
    public DocumentDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
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

    public Integer getVersionCount() {
        return versionCount;
    }

    public void setVersionCount(Integer versionCount) {
        this.versionCount = versionCount;
    }

    public Integer getLatestVersionNumber() {
        return latestVersionNumber;
    }

    public void setLatestVersionNumber(Integer latestVersionNumber) {
        this.latestVersionNumber = latestVersionNumber;
    }
} 