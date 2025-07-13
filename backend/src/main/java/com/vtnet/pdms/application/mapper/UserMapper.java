package com.vtnet.pdms.application.mapper;

import com.vtnet.pdms.application.dto.UserCreateDTO;
import com.vtnet.pdms.application.dto.UserResponseDTO;
import com.vtnet.pdms.application.dto.UserUpdateDTO;
import com.vtnet.pdms.domain.model.Role;
import com.vtnet.pdms.domain.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mapper for converting between User entity and User DTOs.
 */
@Component
public class UserMapper {

    private final RoleMapper roleMapper;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserMapper(RoleMapper roleMapper, PasswordEncoder passwordEncoder) {
        this.roleMapper = roleMapper;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Converts a User entity to a UserResponseDTO.
     *
     * @param user The User entity to convert
     * @return The corresponding UserResponseDTO
     */
    public UserResponseDTO toDto(User user) {
        if (user == null) {
            return null;
        }

        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setRoles(roleMapper.toDtoSet(user.getRoles()));
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());

        return dto;
    }

    /**
     * Converts a list of User entities to a list of UserResponseDTOs.
     *
     * @param users The list of User entities to convert
     * @return The corresponding list of UserResponseDTOs
     */
    public List<UserResponseDTO> toDtoList(List<User> users) {
        if (users == null) {
            return null;
        }

        return users.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Converts a Page of User entities to a Page of UserResponseDTOs.
     *
     * @param userPage The Page of User entities to convert
     * @return The corresponding Page of UserResponseDTOs
     */
    public Page<UserResponseDTO> toDtoPage(Page<User> userPage) {
        if (userPage == null) {
            return null;
        }

        return userPage.map(this::toDto);
    }

    /**
     * Converts a UserCreateDTO to a new User entity.
     *
     * @param dto The UserCreateDTO to convert
     * @return The corresponding User entity
     */
    public User toEntity(UserCreateDTO dto) {
        if (dto == null) {
            return null;
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));

        return user;
    }

    /**
     * Updates a User entity with data from a UserUpdateDTO.
     *
     * @param user The User entity to update
     * @param dto  The UserUpdateDTO containing the new data
     * @return The updated User entity
     */
    public User updateEntity(User user, UserUpdateDTO dto) {
        if (user == null || dto == null) {
            return user;
        }

        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        
        if (dto.isPasswordChangeRequested()) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        return user;
    }

    /**
     * Updates the roles of a User entity.
     *
     * @param user  The User entity to update
     * @param roles The new set of roles
     * @return The updated User entity
     */
    public User updateRoles(User user, Set<Role> roles) {
        if (user == null || roles == null) {
            return user;
        }

        user.setRoles(roles);
        return user;
    }
} 