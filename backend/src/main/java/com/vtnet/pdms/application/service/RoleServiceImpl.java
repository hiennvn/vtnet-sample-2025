package com.vtnet.pdms.application.service;

import com.vtnet.pdms.application.dto.RoleDTO;
import com.vtnet.pdms.application.mapper.RoleMapper;
import com.vtnet.pdms.domain.model.Role;
import com.vtnet.pdms.domain.repository.RoleRepository;
import com.vtnet.pdms.domain.service.RoleService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of the RoleService interface.
 */
@Service
@Transactional
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    /**
     * Constructor with dependency injection.
     *
     * @param roleRepository Repository for role operations
     * @param roleMapper     Mapper for role entity-DTO conversion
     */
    @Autowired
    public RoleServiceImpl(RoleRepository roleRepository, RoleMapper roleMapper) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<RoleDTO> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        return roleMapper.toDtoList(roles);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public RoleDTO getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with ID: " + id));
        return roleMapper.toDto(role);
    }
} 