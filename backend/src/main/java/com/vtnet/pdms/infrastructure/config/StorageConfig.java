package com.vtnet.pdms.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Configuration for document storage.
 * Sets up the storage location for document files.
 */
@Configuration
public class StorageConfig {

    @Value("${storage.location}")
    private String storageLocation;

    /**
     * Creates the storage directory if it doesn't exist.
     * 
     * @return Path to the storage location
     * @throws IOException if the directory cannot be created
     */
    @Bean
    public Path storageLocation() throws IOException {
        Path location = Paths.get(storageLocation);
        if (!Files.exists(location)) {
            Files.createDirectories(location);
        }
        return location;
    }
} 