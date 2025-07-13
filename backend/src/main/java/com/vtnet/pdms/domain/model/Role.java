package com.vtnet.pdms.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Objects;

/**
 * Entity representing a role in the system.
 */
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(max = 50)
    @Column(name = "name", unique = true, nullable = false, length = 50)
    private String name;

    /**
     * Predefined role constants
     */
    public static final String ROLE_DIRECTOR = "DIRECTOR";
    public static final String ROLE_PROJECT_MANAGER = "PROJECT_MANAGER";
    public static final String ROLE_TEAM_MEMBER = "TEAM_MEMBER";

    /**
     * Default constructor required by JPA.
     */
    public Role() {
    }

    /**
     * Constructor with required fields.
     *
     * @param name Role name
     */
    public Role(String name) {
        this.name = name;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Object methods

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Role role = (Role) o;
        return Objects.equals(id, role.id) || 
               (name != null && Objects.equals(name, role.name));
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }

    @Override
    public String toString() {
        return "Role{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
} 