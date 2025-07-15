package com.vtnet.pdms.infrastructure.storage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Implementation of StorageService that stores files in the file system.
 */
@Service
public class FileSystemStorageService implements StorageService {

    private final Path rootLocation;

    @Autowired
    public FileSystemStorageService(Path storageLocation) {
        this.rootLocation = storageLocation;
    }

    @Override
    public Path store(MultipartFile file, String filename) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Failed to store empty file");
        }
        
        String cleanFilename = StringUtils.cleanPath(filename);
        if (cleanFilename.contains("..")) {
            // Security check to prevent directory traversal attacks
            throw new IllegalArgumentException("Cannot store file with relative path outside current directory");
        }
        
        // Check if the filename contains a path
        Path destinationFile;
        if (cleanFilename.contains("/")) {
            // Extract the directory path and ensure it exists
            String dirPath = cleanFilename.substring(0, cleanFilename.lastIndexOf("/"));
            Path dirLocation = this.rootLocation.resolve(dirPath).normalize().toAbsolutePath();
            
            // Create directories if they don't exist
            if (!Files.exists(dirLocation)) {
                Files.createDirectories(dirLocation);
            }
            
            // Resolve the full path for the file
            destinationFile = this.rootLocation.resolve(cleanFilename).normalize().toAbsolutePath();
        } else {
            // Generate a unique filename to prevent overwriting existing files
            String uniqueFilename = UUID.randomUUID() + "-" + cleanFilename;
            destinationFile = this.rootLocation.resolve(uniqueFilename).normalize().toAbsolutePath();
        }
        
        // Ensure the destination is within the storage location
        if (!destinationFile.startsWith(this.rootLocation.toAbsolutePath())) {
            throw new IllegalArgumentException("Cannot store file outside current directory");
        }
        
        // Copy the file to the destination
        Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);
        
        return destinationFile;
    }

    @Override
    public Resource loadAsResource(String filename) {
        try {
            Path file = rootLocation.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not read file: " + filename, e);
        }
    }

    @Override
    public boolean delete(String filename) {
        try {
            Path file = rootLocation.resolve(filename);
            return Files.deleteIfExists(file);
        } catch (IOException e) {
            return false;
        }
    }
    
    @Override
    public Path getPath(String filename) {
        return rootLocation.resolve(filename).normalize().toAbsolutePath();
    }
    
    @Override
    public Path createDirectory(String relativePath) throws IOException {
        String cleanPath = StringUtils.cleanPath(relativePath);
        if (cleanPath.contains("..")) {
            // Security check to prevent directory traversal attacks
            throw new IllegalArgumentException("Cannot create directory with relative path outside current directory");
        }
        
        Path directoryPath = this.rootLocation.resolve(cleanPath).normalize().toAbsolutePath();
        
        // Ensure the directory is within the storage location
        if (!directoryPath.startsWith(this.rootLocation.toAbsolutePath())) {
            throw new IllegalArgumentException("Cannot create directory outside storage location");
        }
        
        // Create the directory if it doesn't exist
        if (!Files.exists(directoryPath)) {
            Files.createDirectories(directoryPath);
        }
        
        return directoryPath;
    }
} 