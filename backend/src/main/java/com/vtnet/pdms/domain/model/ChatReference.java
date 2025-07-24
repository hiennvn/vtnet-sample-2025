package com.vtnet.pdms.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.Objects;

/**
 * Entity representing a chat message reference to a document.
 */
@Entity
@Table(name = "chatbot_references")
public class ChatReference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private ChatMessage message;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @NotNull
    @Column(name = "relevance_score", nullable = false)
    private Float relevanceScore;

    /**
     * Default constructor required by JPA.
     */
    public ChatReference() {
    }

    /**
     * Constructor with required fields.
     *
     * @param message The chat message
     * @param document The referenced document
     * @param relevanceScore The relevance score
     */
    public ChatReference(ChatMessage message, Document document, Float relevanceScore) {
        this.message = message;
        this.document = document;
        this.relevanceScore = relevanceScore;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChatMessage getMessage() {
        return message;
    }

    public void setMessage(ChatMessage message) {
        this.message = message;
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }

    public Float getRelevanceScore() {
        return relevanceScore;
    }

    public void setRelevanceScore(Float relevanceScore) {
        this.relevanceScore = relevanceScore;
    }

    // Object methods

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChatReference that = (ChatReference) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "ChatReference{" +
                "id=" + id +
                ", message=" + (message != null ? message.getId() : null) +
                ", document=" + (document != null ? document.getId() : null) +
                ", relevanceScore=" + relevanceScore +
                '}';
    }
} 