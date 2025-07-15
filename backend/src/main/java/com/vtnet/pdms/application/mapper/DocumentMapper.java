package com.vtnet.pdms.application.mapper;

import com.vtnet.pdms.application.dto.DocumentDTO;
import com.vtnet.pdms.domain.model.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

/**
 * Mapper for converting between Document entity and DTOs.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface DocumentMapper {

    /**
     * Convert Document entity to DocumentDTO.
     *
     * @param document The document entity
     * @return The document DTO
     */
    @Mapping(source = "folder.id", target = "folderId")
    @Mapping(source = "document", target = "versionCount", qualifiedByName = "versionCount")
    @Mapping(source = "document", target = "latestVersionNumber", qualifiedByName = "latestVersionNumber")
    DocumentDTO toDto(Document document);

    /**
     * Convert list of Document entities to list of DocumentDTOs.
     *
     * @param documents The list of document entities
     * @return The list of document DTOs
     */
    List<DocumentDTO> toDtoList(List<Document> documents);

    /**
     * Get the version count for a document.
     *
     * @param document The document entity
     * @return The version count
     */
    @Named("versionCount")
    default Integer versionCount(Document document) {
        return document.getVersions() != null ? document.getVersions().size() : 0;
    }

    /**
     * Get the latest version number for a document.
     *
     * @param document The document entity
     * @return The latest version number
     */
    @Named("latestVersionNumber")
    default Integer latestVersionNumber(Document document) {
        return document.getVersions() != null && !document.getVersions().isEmpty() ?
                document.getVersions().stream()
                        .mapToInt(v -> v.getVersionNumber())
                        .max()
                        .orElse(0) : 0;
    }
} 