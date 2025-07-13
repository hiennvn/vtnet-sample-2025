package com.vtnet.pdms.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Project list view.
 */
public class ProjectListDTO {
    private Long id;
    private String name;
    private String status;
    private int documentCount;
    private LocalDateTime createdAt;
    
    /**
     * Default constructor
     */
    public ProjectListDTO() {
    }
    
    /**
     * Constructor with all fields
     */
    public ProjectListDTO(Long id, String name, String status, int documentCount, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.documentCount = documentCount;
        this.createdAt = createdAt;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getDocumentCount() {
        return documentCount;
    }

    public void setDocumentCount(int documentCount) {
        this.documentCount = documentCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 