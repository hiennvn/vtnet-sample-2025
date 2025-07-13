package com.vtnet.pdms.application.mapper;

import com.vtnet.pdms.application.dto.ProjectListDTO;
import com.vtnet.pdms.domain.model.Project;
import com.vtnet.pdms.domain.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ProjectMapperTest {

    private ProjectMapper projectMapper;
    private User testUser;
    private Project testProject;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        projectMapper = new ProjectMapperImpl();
        
        now = LocalDateTime.now();
        
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        
        testProject = new Project();
        testProject.setId(1L);
        testProject.setName("Test Project");
        testProject.setStatus(Project.STATUS_ACTIVE);
        testProject.setCreatedBy(testUser);
        testProject.setCreatedAt(now);
        testProject.setUpdatedAt(now);
    }

    @Test
    void toListDto_shouldMapProjectToDto() {
        // When
        ProjectListDTO dto = projectMapper.toListDto(testProject);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(testProject.getId());
        assertThat(dto.getName()).isEqualTo(testProject.getName());
        assertThat(dto.getStatus()).isEqualTo(testProject.getStatus());
        assertThat(dto.getDocumentCount()).isEqualTo(0);
        assertThat(dto.getCreatedAt()).isEqualTo(testProject.getCreatedAt());
    }

    @Test
    void toListDto_withDocumentCount_shouldMapProjectToDtoWithCount() {
        // Given
        int documentCount = 5;

        // When
        ProjectListDTO dto = projectMapper.toListDto(testProject, documentCount);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.getDocumentCount()).isEqualTo(documentCount);
    }

    @Test
    void toListDtoList_shouldMapProjectListToDtoList() {
        // Given
        Project anotherProject = new Project();
        anotherProject.setId(2L);
        anotherProject.setName("Another Project");
        anotherProject.setStatus(Project.STATUS_COMPLETED);
        anotherProject.setCreatedBy(testUser);
        anotherProject.setCreatedAt(now);
        anotherProject.setUpdatedAt(now);

        List<Project> projects = List.of(testProject, anotherProject);

        // When
        List<ProjectListDTO> dtos = projectMapper.toListDtoList(projects);

        // Then
        assertThat(dtos).hasSize(2);
        assertThat(dtos.get(0).getId()).isEqualTo(testProject.getId());
        assertThat(dtos.get(1).getId()).isEqualTo(anotherProject.getId());
    }

    @Test
    void toListDtoList_withDocumentCounts_shouldMapProjectListToDtoListWithCounts() {
        // Given
        Project anotherProject = new Project();
        anotherProject.setId(2L);
        anotherProject.setName("Another Project");
        anotherProject.setStatus(Project.STATUS_COMPLETED);
        anotherProject.setCreatedBy(testUser);
        anotherProject.setCreatedAt(now);
        anotherProject.setUpdatedAt(now);

        List<Project> projects = List.of(testProject, anotherProject);
        
        Map<Long, Integer> documentCounts = new HashMap<>();
        documentCounts.put(1L, 5);
        documentCounts.put(2L, 10);

        // When
        List<ProjectListDTO> dtos = projectMapper.toListDtoList(projects, documentCounts);

        // Then
        assertThat(dtos).hasSize(2);
        assertThat(dtos.get(0).getDocumentCount()).isEqualTo(5);
        assertThat(dtos.get(1).getDocumentCount()).isEqualTo(10);
    }

    @Test
    void toListDtoPage_shouldMapProjectPageToDtoPage() {
        // Given
        List<Project> projects = List.of(testProject);
        Page<Project> projectPage = new PageImpl<>(projects, PageRequest.of(0, 10), 1);

        // When
        Page<ProjectListDTO> dtoPage = projectMapper.toListDtoPage(projectPage);

        // Then
        assertThat(dtoPage).isNotNull();
        assertThat(dtoPage.getContent()).hasSize(1);
        assertThat(dtoPage.getTotalElements()).isEqualTo(1);
    }

    @Test
    void toListDtoPage_withDocumentCounts_shouldMapProjectPageToDtoPageWithCounts() {
        // Given
        List<Project> projects = List.of(testProject);
        Page<Project> projectPage = new PageImpl<>(projects, PageRequest.of(0, 10), 1);
        
        Map<Long, Integer> documentCounts = new HashMap<>();
        documentCounts.put(1L, 5);

        // When
        Page<ProjectListDTO> dtoPage = projectMapper.toListDtoPage(projectPage, documentCounts);

        // Then
        assertThat(dtoPage).isNotNull();
        assertThat(dtoPage.getContent()).hasSize(1);
        assertThat(dtoPage.getContent().get(0).getDocumentCount()).isEqualTo(5);
    }
} 