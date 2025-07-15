package com.vtnet.pdms.application.mapper;

import com.vtnet.pdms.application.dto.ProjectMemberDTO;
import com.vtnet.pdms.domain.model.ProjectMember;

import java.util.List;

/**
 * Mapper for converting between ProjectMember entities and DTOs.
 */
public interface ProjectMemberMapper {

    /**
     * Maps a ProjectMember entity to a ProjectMemberDTO.
     *
     * @param projectMember The project member entity
     * @return The project member DTO
     */
    ProjectMemberDTO toDto(ProjectMember projectMember);

    /**
     * Maps a list of ProjectMember entities to a list of ProjectMemberDTOs.
     *
     * @param projectMembers The list of project member entities
     * @return The list of project member DTOs
     */
    List<ProjectMemberDTO> toDtoList(List<ProjectMember> projectMembers);
} 