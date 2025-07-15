package com.vtnet.pdms.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

/**
 * DTO for document upload requests.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUploadDTO {

    /**
     * The name of the document.
     */
    @NotBlank(message = "Document name is required")
    private String name;

    /**
     * The project ID the document belongs to.
     */
    @NotNull(message = "Project ID is required")
    private Long projectId;

    /**
     * The folder ID the document belongs to (can be null for root level).
     */
    private Long folderId;

    /**
     * The file to upload.
     */
    @NotNull(message = "File is required")
    private MultipartFile file;
} 