package com.vtnet.pdms.application.dto;

import java.util.Objects;

/**
 * DTO for role data.
 */
public class RoleDTO {

    private Long id;
    private String name;

    /**
     * Default constructor.
     */
    public RoleDTO() {
    }

    /**
     * Constructor with all fields.
     *
     * @param id   Role ID
     * @param name Role name
     */
    public RoleDTO(Long id, String name) {
        this.id = id;
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
        RoleDTO roleDTO = (RoleDTO) o;
        return Objects.equals(id, roleDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "RoleDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
} 