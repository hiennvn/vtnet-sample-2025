package com.vtnet.pdms.application.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for updating a project member.
 */
public class ProjectMemberUpdateDTO {

    @NotNull(message = "Role is required")
    private String role;

    /**
     * Default constructor.
     */
    public ProjectMemberUpdateDTO() {
    }

    /**
     * Constructor with role.
     *
     * @param role The role in the project
     */
    public ProjectMemberUpdateDTO(String role) {
        this.role = role;
    }

    // Getters and setters

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public String toString() {
        return "ProjectMemberUpdateDTO{" +
                "role='" + role + '\'' +
                '}';
    }
} 