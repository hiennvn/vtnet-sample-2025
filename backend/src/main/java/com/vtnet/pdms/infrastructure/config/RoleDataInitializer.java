package com.vtnet.pdms.infrastructure.config;

import com.vtnet.pdms.domain.model.Role;
import com.vtnet.pdms.domain.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.Arrays;
import java.util.List;

/**
 * Configuration class to initialize default roles in the system.
 */
@Configuration
public class RoleDataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(RoleDataInitializer.class);

    /**
     * Creates a CommandLineRunner bean that initializes default roles if they don't exist.
     *
     * @param roleRepository The repository for role operations
     * @return A CommandLineRunner that initializes roles
     */
    @Bean
    @Order(1)
    public CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            logger.info("Initializing default roles");

            List<String> defaultRoles = Arrays.asList(
                    Role.ROLE_DIRECTOR,
                    Role.ROLE_PROJECT_MANAGER,
                    Role.ROLE_TEAM_MEMBER
            );

            for (String roleName : defaultRoles) {
                if (!roleRepository.existsByName(roleName)) {
                    Role role = new Role(roleName);
                    roleRepository.save(role);
                    logger.info("Created role: {}", roleName);
                } else {
                    logger.info("Role already exists: {}", roleName);
                }
            }

            logger.info("Role initialization completed");
        };
    }
} 