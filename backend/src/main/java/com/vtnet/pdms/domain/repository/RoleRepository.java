package com.vtnet.pdms.domain.repository;

import com.vtnet.pdms.domain.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Role entity operations.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Find a role by name.
     *
     * @param name The role name to search for
     * @return An Optional containing the role if found, or empty if not found
     */
    Optional<Role> findByName(String name);

    /**
     * Find roles with names in the provided collection.
     *
     * @param names Collection of role names to search for
     * @return List of roles with matching names
     */
    List<Role> findByNameIn(Collection<String> names);

    /**
     * Check if a role with the given name exists.
     *
     * @param name The role name to check
     * @return true if a role with the name exists, false otherwise
     */
    boolean existsByName(String name);
} 