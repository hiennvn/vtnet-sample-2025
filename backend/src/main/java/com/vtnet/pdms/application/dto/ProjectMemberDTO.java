package com.vtnet.pdms.application.dto;

import java.time.LocalDateTime;

/**
 * DTO for project member information.
 */
public class ProjectMemberDTO {

    private Long userId;
    private String userName;
    private String userEmail;
    private String role;
    private LocalDateTime addedAt;

    /**
     * Default constructor.
     */
    public ProjectMemberDTO() {
    }

    /**
     * Constructor with all fields.
     *
     * @param userId The user ID
     * @param userName The user name
     * @param userEmail The user email
     * @param role The role in the project
     * @param addedAt When the member was added
     */
    public ProjectMemberDTO(Long userId, String userName, String userEmail, String role, LocalDateTime addedAt) {
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.role = role;
        this.addedAt = addedAt;
    }

    // Getters and setters

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }

    @Override
    public String toString() {
        return "ProjectMemberDTO{" +
                "userId=" + userId +
                ", userName='" + userName + '\'' +
                ", userEmail='" + userEmail + '\'' +
                ", role='" + role + '\'' +
                ", addedAt=" + addedAt +
                '}';
    }
} 