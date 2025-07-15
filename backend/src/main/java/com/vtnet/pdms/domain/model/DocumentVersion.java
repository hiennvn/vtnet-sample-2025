package com.vtnet.pdms.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entity representing a document version in the system.
 */
@Entity
@Table(name = "document_versions")
public class DocumentVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @NotNull
    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @NotNull
    @Size(max = 512)
    @Column(name = "storage_path", nullable = false)
    private String storagePath;

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

    @OneToOne(mappedBy = "documentVersion", cascade = CascadeType.ALL, orphanRemoval = true)
    private DocumentContent documentContent;

    /**
     * Default constructor required by JPA.
     */
    public DocumentVersion() {
    }

    /**
     * Constructor with required fields.
     *
     * @param document The document this version belongs to
     * @param versionNumber Version number
     * @param storagePath Path where the document is stored
     * @param size Size of the document in bytes
     * @param createdBy User who created the version
     */
    public DocumentVersion(Document document, Integer versionNumber, String storagePath, Long size, User createdBy) {
        this.document = document;
        this.versionNumber = versionNumber;
        this.storagePath = storagePath;
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

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
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

    public DocumentContent getDocumentContent() {
        return documentContent;
    }

    public void setDocumentContent(DocumentContent documentContent) {
        this.documentContent = documentContent;
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
        DocumentVersion that = (DocumentVersion) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "DocumentVersion{" +
                "id=" + id +
                ", document=" + (document != null ? document.getId() : null) +
                ", versionNumber=" + versionNumber +
                ", storagePath='" + storagePath + '\'' +
                ", size=" + size +
                ", createdAt=" + createdAt +
                '}';
    }
} 