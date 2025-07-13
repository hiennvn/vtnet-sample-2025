package com.vtnet.pdms.domain.service;

import com.vtnet.pdms.application.dto.RoleDTO;

import java.util.List;

/**
 * Service interface for role management operations.
 */
public interface RoleService {

    /**
     * Retrieves all roles.
     *
     * @return List of all roles
     */
    List<RoleDTO> getAllRoles();

    /**
     * Retrieves a role by ID.
     *
     * @param id The ID of the role to retrieve
     * @return The role data
     */
    RoleDTO getRoleById(Long id);
} 