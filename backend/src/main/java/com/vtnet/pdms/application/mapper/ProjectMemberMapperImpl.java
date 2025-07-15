package com.vtnet.pdms.application.mapper;

import com.vtnet.pdms.application.dto.ProjectMemberDTO;
import com.vtnet.pdms.domain.model.ProjectMember;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the ProjectMemberMapper interface.
 */
@Component
public class ProjectMemberMapperImpl implements ProjectMemberMapper {

    /**
     * {@inheritDoc}
     */
    @Override
    public ProjectMemberDTO toDto(ProjectMember projectMember) {
        if (projectMember == null) {
            return null;
        }

        return new ProjectMemberDTO(
                projectMember.getUser().getId(),
                projectMember.getUser().getName(),
                projectMember.getUser().getEmail(),
                projectMember.getRole(),
                projectMember.getAddedAt()
        );
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<ProjectMemberDTO> toDtoList(List<ProjectMember> projectMembers) {
        if (projectMembers == null) {
            return List.of();
        }

        return projectMembers.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
} 