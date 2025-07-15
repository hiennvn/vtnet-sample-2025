package com.vtnet.pdms.application.mapper;

import com.vtnet.pdms.application.dto.FolderDTO;
import com.vtnet.pdms.domain.model.Folder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

/**
 * Mapper for converting between Folder entity and DTOs.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface FolderMapper {

    /**
     * Convert Folder entity to FolderDTO.
     *
     * @param folder The folder entity
     * @return The folder DTO
     */
    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "parentFolder.id", target = "parentFolderId")
    @Mapping(source = "folder", target = "hasSubfolders", qualifiedByName = "hasSubfolders")
    FolderDTO toDto(Folder folder);

    /**
     * Convert list of Folder entities to list of FolderDTOs.
     *
     * @param folders The list of folder entities
     * @return The list of folder DTOs
     */
    List<FolderDTO> toDtoList(List<Folder> folders);

    /**
     * Determine if a folder has subfolders.
     *
     * @param folder The folder entity
     * @return True if the folder has subfolders
     */
    @Named("hasSubfolders")
    default Boolean hasSubfolders(Folder folder) {
        return folder.getSubfolders() != null && !folder.getSubfolders().isEmpty();
    }
} 