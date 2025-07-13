package com.vtnet.pdms.application.mapper;

import com.vtnet.pdms.application.dto.ProjectListDTO;
import com.vtnet.pdms.domain.model.Project;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

/**
 * Mapper for converting between Project entities and DTOs.
 */
public interface ProjectMapper {

    /**
     * Maps a Project entity to a ProjectListDTO.
     *
     * @param project The project entity
     * @return The project DTO
     */
    ProjectListDTO toListDto(Project project);

    /**
     * Maps a Project entity to a ProjectListDTO with document count.
     *
     * @param project The project entity
     * @param documentCount The document count for the project
     * @return The project DTO with document count
     */
    ProjectListDTO toListDto(Project project, Integer documentCount);

    /**
     * Maps a list of Project entities to a list of ProjectListDTOs.
     *
     * @param projects The list of project entities
     * @return The list of project DTOs
     */
    List<ProjectListDTO> toListDtoList(List<Project> projects);

    /**
     * Maps a list of Project entities to a list of ProjectListDTOs with document counts.
     *
     * @param projects The list of project entities
     * @param documentCounts Map of project IDs to document counts
     * @return The list of project DTOs with document counts
     */
    List<ProjectListDTO> toListDtoList(List<Project> projects, Map<Long, Integer> documentCounts);

    /**
     * Maps a page of Project entities to a page of ProjectListDTOs.
     *
     * @param projectPage The page of project entities
     * @return The page of project DTOs
     */
    Page<ProjectListDTO> toListDtoPage(Page<Project> projectPage);

    /**
     * Maps a page of Project entities to a page of ProjectListDTOs with document counts.
     *
     * @param projectPage The page of project entities
     * @param documentCounts Map of project IDs to document counts
     * @return The page of project DTOs with document counts
     */
    Page<ProjectListDTO> toListDtoPage(Page<Project> projectPage, Map<Long, Integer> documentCounts);
} 