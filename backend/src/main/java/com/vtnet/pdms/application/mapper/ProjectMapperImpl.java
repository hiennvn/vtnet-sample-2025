package com.vtnet.pdms.application.mapper;

import com.vtnet.pdms.application.dto.ProjectCreateDTO;
import com.vtnet.pdms.application.dto.ProjectListDTO;
import com.vtnet.pdms.application.dto.ProjectUpdateDTO;
import com.vtnet.pdms.domain.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementation of the ProjectMapper interface.
 */
@Component
public class ProjectMapperImpl implements ProjectMapper {

    /**
     * {@inheritDoc}
     */
    @Override
    public ProjectListDTO toListDto(Project project) {
        return toListDto(project, 0);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ProjectListDTO toListDto(Project project, Integer documentCount) {
        if (project == null) {
            return null;
        }

        return new ProjectListDTO(
                project.getId(),
                project.getName(),
                project.getStatus(),
                documentCount,
                project.getCreatedAt()
        );
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<ProjectListDTO> toListDtoList(List<Project> projects) {
        if (projects == null) {
            return List.of();
        }

        return projects.stream()
                .map(this::toListDto)
                .collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<ProjectListDTO> toListDtoList(List<Project> projects, Map<Long, Integer> documentCounts) {
        if (projects == null) {
            return List.of();
        }

        return projects.stream()
                .map(project -> toListDto(project, documentCounts.getOrDefault(project.getId(), 0)))
                .collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Page<ProjectListDTO> toListDtoPage(Page<Project> projectPage) {
        if (projectPage == null) {
            return Page.empty();
        }

        List<ProjectListDTO> dtos = projectPage.getContent().stream()
                .map(this::toListDto)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, projectPage.getPageable(), projectPage.getTotalElements());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Page<ProjectListDTO> toListDtoPage(Page<Project> projectPage, Map<Long, Integer> documentCounts) {
        if (projectPage == null) {
            return Page.empty();
        }

        List<ProjectListDTO> dtos = projectPage.getContent().stream()
                .map(project -> toListDto(project, documentCounts.getOrDefault(project.getId(), 0)))
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, projectPage.getPageable(), projectPage.getTotalElements());
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public Project toEntity(ProjectCreateDTO projectCreateDTO) {
        if (projectCreateDTO == null) {
            return null;
        }

        Project project = new Project();
        project.setName(projectCreateDTO.getName());
        project.setDescription(projectCreateDTO.getDescription());
        
        return project;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public Project updateEntityFromDto(Project project, ProjectUpdateDTO projectUpdateDTO) {
        if (project == null || projectUpdateDTO == null) {
            return project;
        }
        
        project.setName(projectUpdateDTO.getName());
        project.setDescription(projectUpdateDTO.getDescription());
        project.setStatus(projectUpdateDTO.getStatus());
        
        return project;
    }
} 