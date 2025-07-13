package com.vtnet.pdms.interfaces.api;

import com.vtnet.pdms.application.dto.RoleDTO;
import com.vtnet.pdms.domain.service.RoleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for role management operations.
 */
@RestController
@RequestMapping("/roles")
public class RoleController {

    private static final Logger logger = LoggerFactory.getLogger(RoleController.class);

    private final RoleService roleService;

    /**
     * Constructor with dependency injection.
     *
     * @param roleService Service for role operations
     */
    @Autowired
    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    /**
     * Retrieves all roles.
     *
     * @return List of all roles
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('DIRECTOR')")
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        logger.info("REST request to get all roles");
        List<RoleDTO> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    /**
     * Retrieves a role by ID.
     *
     * @param id The ID of the role to retrieve
     * @return The role data
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('DIRECTOR')")
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable Long id) {
        logger.info("REST request to get role: {}", id);
        RoleDTO role = roleService.getRoleById(id);
        return ResponseEntity.ok(role);
    }
} 