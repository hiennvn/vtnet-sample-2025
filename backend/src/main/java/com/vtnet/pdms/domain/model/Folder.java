package com.vtnet.pdms.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * Entity representing a folder in the system.
 */
@Entity
@Table(name = "folders")
public class Folder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_folder_id")
    private Folder parentFolder;

    @NotNull
    @Size(max = 255)
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @OneToMany(mappedBy = "parentFolder", cascade = CascadeType.ALL)
    private Set<Folder> subfolders = new HashSet<>();

    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL)
    private Set<Document> documents = new HashSet<>();

    /**
     * Default constructor required by JPA.
     */
    public Folder() {
    }

    /**
     * Constructor with required fields.
     *
     * @param project The project this folder belongs to
     * @param name Folder name
     * @param createdBy User who created the folder
     */
    public Folder(Project project, String name, User createdBy) {
        this.project = project;
        this.name = name;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Constructor with parent folder.
     *
     * @param project The project this folder belongs to
     * @param parentFolder The parent folder
     * @param name Folder name
     * @param createdBy User who created the folder
     */
    public Folder(Project project, Folder parentFolder, String name, User createdBy) {
        this(project, name, createdBy);
        this.parentFolder = parentFolder;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Folder getParentFolder() {
        return parentFolder;
    }

    public void setParentFolder(Folder parentFolder) {
        this.parentFolder = parentFolder;
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

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Set<Folder> getSubfolders() {
        return subfolders;
    }

    public void setSubfolders(Set<Folder> subfolders) {
        this.subfolders = subfolders;
    }

    public Set<Document> getDocuments() {
        return documents;
    }

    public void setDocuments(Set<Document> documents) {
        this.documents = documents;
    }

    // Helper methods

    /**
     * Adds a subfolder to this folder.
     *
     * @param name The subfolder name
     * @param createdBy User creating the subfolder
     * @return The created subfolder
     */
    public Folder addSubfolder(String name, User createdBy) {
        Folder subfolder = new Folder(this.project, this, name, createdBy);
        this.subfolders.add(subfolder);
        return subfolder;
    }

    // JPA lifecycle methods

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Object methods

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Folder folder = (Folder) o;
        return Objects.equals(id, folder.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Folder{" +
                "id=" + id +
                ", project=" + (project != null ? project.getId() : null) +
                ", parentFolder=" + (parentFolder != null ? parentFolder.getId() : null) +
                ", name='" + name + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
} 