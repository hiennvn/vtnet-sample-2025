package com.vtnet.pdms.infrastructure.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

/**
 * Service interface for handling file storage operations.
 */
public interface StorageService {

    /**
     * Store a file with a specific filename.
     *
     * @param file The file to store
     * @param filename The name to use for the stored file
     * @return The path where the file was stored
     * @throws IOException If an I/O error occurs
     */
    Path store(MultipartFile file, String filename) throws IOException;

    /**
     * Load a file as a resource.
     *
     * @param filename The name of the file to load
     * @return The file as a resource
     */
    Resource loadAsResource(String filename);

    /**
     * Delete a file.
     *
     * @param filename The name of the file to delete
     * @return true if the file was deleted, false otherwise
     */
    boolean delete(String filename);
    
    /**
     * Get the absolute path for a filename.
     *
     * @param filename The name of the file
     * @return The absolute path
     */
    Path getPath(String filename);
    
    /**
     * Creates a directory at the specified path relative to the root location.
     *
     * @param relativePath The path relative to the root location
     * @return The created directory path
     * @throws IOException If an I/O error occurs
     */
    Path createDirectory(String relativePath) throws IOException;
} 