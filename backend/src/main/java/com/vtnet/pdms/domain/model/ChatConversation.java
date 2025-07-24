package com.vtnet.pdms.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * Entity representing a chat conversation in the system.
 */
@Entity
@Table(name = "chatbot_conversations")
public class ChatConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @NotNull
    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @NotNull
    @Column(name = "last_message_at", nullable = false)
    private LocalDateTime lastMessageAt;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ChatMessage> messages = new HashSet<>();

    /**
     * Default constructor required by JPA.
     */
    public ChatConversation() {
    }

    /**
     * Constructor with required fields.
     *
     * @param user The user who started the conversation
     * @param project The project this conversation is about (can be null for global conversations)
     */
    public ChatConversation(User user, Project project) {
        this.user = user;
        this.project = project;
        this.startedAt = LocalDateTime.now();
        this.lastMessageAt = this.startedAt;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public Set<ChatMessage> getMessages() {
        return messages;
    }

    public void setMessages(Set<ChatMessage> messages) {
        this.messages = messages;
    }

    // Helper methods

    /**
     * Adds a user message to this conversation.
     *
     * @param content The message content
     * @return The created chat message
     */
    public ChatMessage addUserMessage(String content) {
        ChatMessage message = new ChatMessage(this, ChatMessage.MESSAGE_TYPE_USER, content);
        this.messages.add(message);
        this.lastMessageAt = LocalDateTime.now();
        return message;
    }

    /**
     * Adds a bot message to this conversation.
     *
     * @param content The message content
     * @return The created chat message
     */
    public ChatMessage addBotMessage(String content) {
        ChatMessage message = new ChatMessage(this, ChatMessage.MESSAGE_TYPE_BOT, content);
        this.messages.add(message);
        this.lastMessageAt = LocalDateTime.now();
        return message;
    }

    // JPA lifecycle methods

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
        lastMessageAt = startedAt;
    }

    // Object methods

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChatConversation that = (ChatConversation) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "ChatConversation{" +
                "id=" + id +
                ", user=" + (user != null ? user.getId() : null) +
                ", project=" + (project != null ? project.getId() : null) +
                ", startedAt=" + startedAt +
                ", lastMessageAt=" + lastMessageAt +
                '}';
    }
} 