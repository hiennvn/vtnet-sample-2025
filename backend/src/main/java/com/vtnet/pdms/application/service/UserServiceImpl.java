package com.vtnet.pdms.application.service;

import com.vtnet.pdms.application.dto.UserCreateDTO;
import com.vtnet.pdms.application.dto.UserResponseDTO;
import com.vtnet.pdms.application.dto.UserUpdateDTO;
import com.vtnet.pdms.application.mapper.UserMapper;
import com.vtnet.pdms.domain.model.Role;
import com.vtnet.pdms.domain.model.User;
import com.vtnet.pdms.domain.repository.RoleRepository;
import com.vtnet.pdms.domain.repository.UserRepository;
import com.vtnet.pdms.domain.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Implementation of the UserService interface.
 */
@Service
@Transactional
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    /**
     * Constructor with dependency injection.
     *
     * @param userRepository Repository for user operations
     * @param roleRepository Repository for role operations
     * @param userMapper     Mapper for user entity-DTO conversion
     */
    @Autowired
    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public UserResponseDTO createUser(UserCreateDTO userDto) {
        logger.info("Creating new user with email: {}", userDto.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new DataIntegrityViolationException("Email already exists: " + userDto.getEmail());
        }

        // Create user entity from DTO
        User user = userMapper.toEntity(userDto);

        // Fetch and assign roles
        Set<Role> roles = fetchRolesByIds(userDto.getRoleIds());
        user = userMapper.updateRoles(user, roles);

        // Save user to database
        User savedUser = userRepository.save(user);
        logger.info("User created with ID: {}", savedUser.getId());

        return userMapper.toDto(savedUser);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @securityUtils.isCurrentUser(#id)")
    public UserResponseDTO updateUser(Long id, UserUpdateDTO userDto) {
        logger.info("Updating user with ID: {}", id);

        // Find user by ID
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + id));

        // Check if email is already taken by another user
        if (!user.getEmail().equals(userDto.getEmail()) && userRepository.existsByEmail(userDto.getEmail())) {
            throw new DataIntegrityViolationException("Email already exists: " + userDto.getEmail());
        }

        // Update user entity from DTO
        user = userMapper.updateEntity(user, userDto);

        // Update roles if provided
        if (userDto.getRoleIds() != null && !userDto.getRoleIds().isEmpty()) {
            Set<Role> roles = fetchRolesByIds(userDto.getRoleIds());
            user = userMapper.updateRoles(user, roles);
        }

        // Save updated user to database
        User updatedUser = userRepository.save(user);
        logger.info("User updated with ID: {}", updatedUser.getId());

        return userMapper.toDto(updatedUser);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public void deleteUser(Long id) {
        logger.info("Deleting user with ID: {}", id);

        // Check if user exists
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("User not found with ID: " + id);
        }

        // Delete user
        userRepository.deleteById(id);
        logger.info("User deleted with ID: {}", id);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @securityUtils.isCurrentUser(#id)")
    public UserResponseDTO getUserById(Long id) {
        logger.debug("Fetching user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + id));

        return userMapper.toDto(user);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public Page<UserResponseDTO> getAllUsers(Pageable pageable) {
        logger.debug("Fetching all users with pagination");

        Page<User> userPage = userRepository.findAll(pageable);
        return userMapper.toDtoPage(userPage);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public Page<UserResponseDTO> searchUsers(String query, Pageable pageable) {
        logger.debug("Searching users with query: {}", query);

        Page<User> userPage = userRepository.searchByNameOrEmail(query, pageable);
        return userMapper.toDtoPage(userPage);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Fetches roles by their IDs.
     *
     * @param roleIds Set of role IDs to fetch
     * @return Set of Role entities
     */
    private Set<Role> fetchRolesByIds(Set<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return new HashSet<>();
        }

        return roleIds.stream()
                .map(roleId -> roleRepository.findById(roleId)
                        .orElseThrow(() -> new EntityNotFoundException("Role not found with ID: " + roleId)))
                .collect(Collectors.toSet());
    }
} 