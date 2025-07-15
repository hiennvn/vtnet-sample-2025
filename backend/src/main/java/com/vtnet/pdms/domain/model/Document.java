package com.vtnet.pdms.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * Entity representing a document in the system.
 */
@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id", nullable = false)
    private Folder folder;

    @NotNull
    @Size(max = 255)
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Size(max = 100)
    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @NotNull
    @Column(name = "size", nullable = false)
    private Long size;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<DocumentVersion> versions = new HashSet<>();

    /**
     * Default constructor required by JPA.
     */
    public Document() {
    }

    /**
     * Constructor with required fields.
     *
     * @param folder The folder this document belongs to
     * @param name Document name
     * @param mimeType Document MIME type
     * @param size Document size in bytes
     * @param createdBy User who created the document
     */
    public Document(Folder folder, String name, String mimeType, Long size, User createdBy) {
        this.folder = folder;
        this.name = name;
        this.mimeType = mimeType;
        this.size = size;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Folder getFolder() {
        return folder;
    }

    public void setFolder(Folder folder) {
        this.folder = folder;
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

    public Set<DocumentVersion> getVersions() {
        return versions;
    }

    public void setVersions(Set<DocumentVersion> versions) {
        this.versions = versions;
    }

    // Helper methods

    /**
     * Adds a new version to this document.
     *
     * @param storagePath Path where the document is stored
     * @param size Size of the document in bytes
     * @param createdBy User creating the version
     * @return The created document version
     */
    public DocumentVersion addVersion(String storagePath, Long size, User createdBy) {
        int versionNumber = versions.size() + 1;
        DocumentVersion version = new DocumentVersion(this, versionNumber, storagePath, size, createdBy);
        this.versions.add(version);
        return version;
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
        Document document = (Document) o;
        return Objects.equals(id, document.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Document{" +
                "id=" + id +
                ", folder=" + (folder != null ? folder.getId() : null) +
                ", name='" + name + '\'' +
                ", mimeType='" + mimeType + '\'' +
                ", size=" + size +
                ", createdAt=" + createdAt +
                '}';
    }
} 