package com.vtnet.pdms.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entity representing document content for search indexing.
 */
@Entity
@Table(name = "document_content")
public class DocumentContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_version_id", nullable = false)
    private DocumentVersion documentVersion;

    @Column(name = "content_text", columnDefinition = "LONGTEXT")
    private String contentText;

    @Column(name = "indexed_at")
    private LocalDateTime indexedAt;

    @Column(name = "embedding_status", length = 20)
    private String embeddingStatus = "PENDING";

    /**
     * Embedding status constants
     */
    public static final String EMBEDDING_STATUS_PENDING = "PENDING";
    public static final String EMBEDDING_STATUS_PROCESSING = "PROCESSING";
    public static final String EMBEDDING_STATUS_COMPLETED = "COMPLETED";
    public static final String EMBEDDING_STATUS_FAILED = "FAILED";

    /**
     * Default constructor required by JPA.
     */
    public DocumentContent() {
    }

    /**
     * Constructor with required fields.
     *
     * @param documentVersion The document version this content belongs to
     * @param contentText The extracted text content
     */
    public DocumentContent(DocumentVersion documentVersion, String contentText) {
        this.documentVersion = documentVersion;
        this.contentText = contentText;
        this.embeddingStatus = EMBEDDING_STATUS_PENDING;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DocumentVersion getDocumentVersion() {
        return documentVersion;
    }

    public void setDocumentVersion(DocumentVersion documentVersion) {
        this.documentVersion = documentVersion;
    }

    public String getContentText() {
        return contentText;
    }

    public void setContentText(String contentText) {
        this.contentText = contentText;
    }

    public LocalDateTime getIndexedAt() {
        return indexedAt;
    }

    public void setIndexedAt(LocalDateTime indexedAt) {
        this.indexedAt = indexedAt;
    }

    public String getEmbeddingStatus() {
        return embeddingStatus;
    }

    public void setEmbeddingStatus(String embeddingStatus) {
        this.embeddingStatus = embeddingStatus;
    }

    /**
     * Marks the content as indexed.
     */
    public void markAsIndexed() {
        this.indexedAt = LocalDateTime.now();
        this.embeddingStatus = EMBEDDING_STATUS_COMPLETED;
    }

    /**
     * Marks the content as failed indexing.
     */
    public void markAsFailed() {
        this.embeddingStatus = EMBEDDING_STATUS_FAILED;
    }

    // Object methods

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DocumentContent that = (DocumentContent) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "DocumentContent{" +
                "id=" + id +
                ", documentVersion=" + (documentVersion != null ? documentVersion.getId() : null) +
                ", embeddingStatus='" + embeddingStatus + '\'' +
                ", indexedAt=" + indexedAt +
                '}';
    }
} 