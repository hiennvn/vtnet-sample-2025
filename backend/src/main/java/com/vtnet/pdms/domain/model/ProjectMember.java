package com.vtnet.pdms.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entity representing a project member in the system.
 */
@Entity
@Table(name = "project_members")
public class ProjectMember {

    @EmbeddedId
    private ProjectMemberPK id;

    @NotNull
    @Size(max = 50)
    @Column(name = "role", nullable = false, length = 50)
    private String role;

    @NotNull
    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;

    @ManyToOne
    @JoinColumn(name = "added_by", nullable = false)
    private User addedBy;

    /**
     * Default constructor required by JPA.
     */
    public ProjectMember() {
    }

    /**
     * Constructor with required fields.
     *
     * @param project The project
     * @param user The user
     * @param role The role in the project
     * @param addedBy The user who added this member
     */
    public ProjectMember(Project project, User user, String role, User addedBy) {
        this.id = new ProjectMemberPK(project, user);
        this.role = role;
        this.addedAt = LocalDateTime.now();
        this.addedBy = addedBy;
    }

    // Getters and Setters

    public ProjectMemberPK getId() {
        return id;
    }

    public void setId(ProjectMemberPK id) {
        this.id = id;
    }

    public Project getProject() {
        return id != null ? id.getProject() : null;
    }

    public User getUser() {
        return id != null ? id.getUser() : null;
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

    public User getAddedBy() {
        return addedBy;
    }

    public void setAddedBy(User addedBy) {
        this.addedBy = addedBy;
    }

    // Object methods

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProjectMember that = (ProjectMember) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "ProjectMember{" +
                "id=" + id +
                ", role='" + role + '\'' +
                ", addedAt=" + addedAt +
                ", addedBy=" + (addedBy != null ? addedBy.getId() : null) +
                '}';
    }

    /**
     * Composite primary key for ProjectMember.
     */
    @Embeddable
    public static class ProjectMemberPK implements java.io.Serializable {

        @ManyToOne
        @JoinColumn(name = "project_id", nullable = false)
        private Project project;

        @ManyToOne
        @JoinColumn(name = "user_id", nullable = false)
        private User user;

        /**
         * Default constructor required by JPA.
         */
        public ProjectMemberPK() {
        }

        /**
         * Constructor with required fields.
         *
         * @param project The project
         * @param user The user
         */
        public ProjectMemberPK(Project project, User user) {
            this.project = project;
            this.user = user;
        }

        // Getters and Setters

        public Project getProject() {
            return project;
        }

        public void setProject(Project project) {
            this.project = project;
        }

        public User getUser() {
            return user;
        }

        public void setUser(User user) {
            this.user = user;
        }

        // Object methods

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ProjectMemberPK that = (ProjectMemberPK) o;
            return Objects.equals(project, that.project) &&
                   Objects.equals(user, that.user);
        }

        @Override
        public int hashCode() {
            return Objects.hash(project, user);
        }
    }
} 