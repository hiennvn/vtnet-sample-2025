package com.vtnet.pdms.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * Entity representing a chat message in the system.
 */
@Entity
@Table(name = "chatbot_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private ChatConversation conversation;

    @NotNull
    @Size(max = 10)
    @Column(name = "message_type", nullable = false)
    private String messageType;

    @NotNull
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @NotNull
    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ChatReference> references = new HashSet<>();

    /**
     * Message type constants
     */
    public static final String MESSAGE_TYPE_USER = "USER";
    public static final String MESSAGE_TYPE_BOT = "BOT";

    /**
     * Default constructor required by JPA.
     */
    public ChatMessage() {
    }

    /**
     * Constructor with required fields.
     *
     * @param conversation The conversation this message belongs to
     * @param messageType The message type (USER or BOT)
     * @param content The message content
     */
    public ChatMessage(ChatConversation conversation, String messageType, String content) {
        this.conversation = conversation;
        this.messageType = messageType;
        this.content = content;
        this.sentAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChatConversation getConversation() {
        return conversation;
    }

    public void setConversation(ChatConversation conversation) {
        this.conversation = conversation;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public Set<ChatReference> getReferences() {
        return references;
    }

    public void setReferences(Set<ChatReference> references) {
        this.references = references;
    }

    // Helper methods

    /**
     * Adds a reference to this message.
     *
     * @param document The referenced document
     * @param relevanceScore The relevance score
     * @return The created chat reference
     */
    public ChatReference addReference(Document document, float relevanceScore) {
        ChatReference reference = new ChatReference(this, document, relevanceScore);
        this.references.add(reference);
        return reference;
    }

    // JPA lifecycle methods

    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
    }

    // Object methods

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChatMessage that = (ChatMessage) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "ChatMessage{" +
                "id=" + id +
                ", conversation=" + (conversation != null ? conversation.getId() : null) +
                ", messageType='" + messageType + '\'' +
                ", sentAt=" + sentAt +
                '}';
    }
} 