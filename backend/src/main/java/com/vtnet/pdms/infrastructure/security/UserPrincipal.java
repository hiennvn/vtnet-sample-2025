package com.vtnet.pdms.infrastructure.security;

import java.io.Serializable;

/**
 * User principal for authentication.
 * Contains user information that can be accessed in security contexts.
 */
public class UserPrincipal implements Serializable {

    private final Long id;
    private final String email;
    private final String name;

    /**
     * Constructor with all fields.
     *
     * @param id    User ID
     * @param email User email
     * @param name  User name
     */
    public UserPrincipal(Long id, String email, String name) {
        this.id = id;
        this.email = email;
        this.name = name;
    }

    /**
     * Gets the user ID.
     *
     * @return The user ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Gets the user email.
     *
     * @return The user email
     */
    public String getEmail() {
        return email;
    }

    /**
     * Gets the user name.
     *
     * @return The user name
     */
    public String getName() {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        UserPrincipal that = (UserPrincipal) o;

        return id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }

    @Override
    public String toString() {
        return "UserPrincipal{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
} 