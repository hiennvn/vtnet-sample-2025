package com.vtnet.pdms.application.mapper;

import com.vtnet.pdms.application.dto.RoleDTO;
import com.vtnet.pdms.domain.model.Role;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mapper for converting between Role entity and RoleDTO.
 */
@Component
public class RoleMapper {

    /**
     * Converts a Role entity to a RoleDTO.
     *
     * @param role The Role entity to convert
     * @return The corresponding RoleDTO
     */
    public RoleDTO toDto(Role role) {
        if (role == null) {
            return null;
        }

        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setId(role.getId());
        roleDTO.setName(role.getName());

        return roleDTO;
    }

    /**
     * Converts a set of Role entities to a set of RoleDTOs.
     *
     * @param roles The set of Role entities to convert
     * @return The corresponding set of RoleDTOs
     */
    public Set<RoleDTO> toDtoSet(Set<Role> roles) {
        if (roles == null) {
            return null;
        }

        return roles.stream()
                .map(this::toDto)
                .collect(Collectors.toSet());
    }

    /**
     * Converts a list of Role entities to a list of RoleDTOs.
     *
     * @param roles The list of Role entities to convert
     * @return The corresponding list of RoleDTOs
     */
    public List<RoleDTO> toDtoList(List<Role> roles) {
        if (roles == null) {
            return null;
        }

        return roles.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Converts a RoleDTO to a Role entity.
     *
     * @param roleDTO The RoleDTO to convert
     * @return The corresponding Role entity
     */
    public Role toEntity(RoleDTO roleDTO) {
        if (roleDTO == null) {
            return null;
        }

        Role role = new Role();
        role.setId(roleDTO.getId());
        role.setName(roleDTO.getName());

        return role;
    }

    /**
     * Updates a Role entity with data from a RoleDTO.
     *
     * @param role    The Role entity to update
     * @param roleDTO The RoleDTO containing the new data
     * @return The updated Role entity
     */
    public Role updateEntity(Role role, RoleDTO roleDTO) {
        if (role == null || roleDTO == null) {
            return role;
        }

        if (roleDTO.getName() != null) {
            role.setName(roleDTO.getName());
        }

        return role;
    }
} 