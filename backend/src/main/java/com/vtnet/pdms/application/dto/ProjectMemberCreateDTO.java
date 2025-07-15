package com.vtnet.pdms.application.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating a project member.
 */
public class ProjectMemberCreateDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Role is required")
    private String role;

    /**
     * Default constructor.
     */
    public ProjectMemberCreateDTO() {
    }

    /**
     * Constructor with all fields.
     *
     * @param userId The user ID
     * @param role The role in the project
     */
    public ProjectMemberCreateDTO(Long userId, String role) {
        this.userId = userId;
        this.role = role;
    }

    // Getters and setters

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public String toString() {
        return "ProjectMemberCreateDTO{" +
                "userId=" + userId +
                ", role='" + role + '\'' +
                '}';
    }
} 