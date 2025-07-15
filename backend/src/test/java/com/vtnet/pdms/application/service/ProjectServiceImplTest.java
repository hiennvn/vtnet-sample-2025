package com.vtnet.pdms.application.service;

import com.vtnet.pdms.application.dto.ProjectListDTO;
import com.vtnet.pdms.application.mapper.ProjectMapper;
import com.vtnet.pdms.domain.model.Document;
import com.vtnet.pdms.domain.model.Project;
import com.vtnet.pdms.domain.model.User;
import com.vtnet.pdms.domain.repository.DocumentRepository;
import com.vtnet.pdms.domain.repository.ProjectMemberRepository;
import com.vtnet.pdms.domain.repository.ProjectRepository;
import com.vtnet.pdms.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class ProjectServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;
    
    @Mock
    private ProjectMemberRepository projectMemberRepository;
    
    @Mock
    private DocumentRepository documentRepository;
    
    @Mock
    private UserRepository userRepository;

    @Mock
    private ProjectMapper projectMapper;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private User testUser;
    private Project testProject;
    private ProjectListDTO testProjectDto;
    private Page<Project> projectPage;
    private Page<ProjectListDTO> projectDtoPage;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        pageable = PageRequest.of(0, 10);
        
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        
        testProject = new Project();
        testProject.setId(1L);
        testProject.setName("Test Project");
        testProject.setStatus(Project.STATUS_ACTIVE);
        testProject.setCreatedBy(testUser);
        testProject.setCreatedAt(LocalDateTime.now());
        
        testProjectDto = new ProjectListDTO();
        testProjectDto.setId(1L);
        testProjectDto.setName("Test Project");
        testProjectDto.setStatus(Project.STATUS_ACTIVE);
        testProjectDto.setDocumentCount(5);
        testProjectDto.setCreatedAt(LocalDateTime.now());
        
        List<Project> projects = List.of(testProject);
        projectPage = new PageImpl<>(projects, pageable, 1);
        
        List<ProjectListDTO> projectDtos = List.of(testProjectDto);
        projectDtoPage = new PageImpl<>(projectDtos, pageable, 1);
    }

    @Test
    @WithMockUser(authorities = {"ROLE_DIRECTOR"})
    void getAllProjects_asDirector_shouldReturnPageOfProjects() {
        // Given
        when(projectRepository.findAll(pageable)).thenReturn(projectPage);
        when(projectMapper.toListDtoPage(eq(projectPage), any(Map.class))).thenReturn(projectDtoPage);
        
        // When
        Page<ProjectListDTO> result = projectService.getAllProjects(pageable);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        
        verify(projectRepository, times(1)).findAll(pageable);
        verify(projectMapper, times(1)).toListDtoPage(eq(projectPage), any(Map.class));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_DIRECTOR"})
    void getProjectsByStatus_asDirector_shouldReturnPageOfProjectsWithStatus() {
        // Given
        when(projectRepository.findByStatus(Project.STATUS_ACTIVE, pageable)).thenReturn(projectPage);
        when(projectMapper.toListDtoPage(eq(projectPage), any(Map.class))).thenReturn(projectDtoPage);
        
        // When
        Page<ProjectListDTO> result = projectService.getProjectsByStatus(Project.STATUS_ACTIVE, pageable);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        
        verify(projectRepository, times(1)).findByStatus(Project.STATUS_ACTIVE, pageable);
        verify(projectMapper, times(1)).toListDtoPage(eq(projectPage), any(Map.class));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_DIRECTOR"})
    void getProjectsByNameContaining_asDirector_shouldReturnPageOfProjectsWithNameContaining() {
        // Given
        String searchTerm = "Test";
        when(projectRepository.findByNameContaining(searchTerm, pageable)).thenReturn(projectPage);
        when(projectMapper.toListDtoPage(eq(projectPage), any(Map.class))).thenReturn(projectDtoPage);
        
        // When
        Page<ProjectListDTO> result = projectService.getProjectsByNameContaining(searchTerm, pageable);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        
        verify(projectRepository, times(1)).findByNameContaining(searchTerm, pageable);
        verify(projectMapper, times(1)).toListDtoPage(eq(projectPage), any(Map.class));
    }

    @Test
    void getDocumentCountsByProjectIds_shouldReturnMapOfCounts() {
        // Given
        List<Long> projectIds = List.of(1L, 2L, 3L);
        
        // Mock document repository responses
        List<Document> project1Docs = new ArrayList<>();
        project1Docs.add(new Document());
        project1Docs.add(new Document());
        
        List<Document> project2Docs = new ArrayList<>();
        project2Docs.add(new Document());
        
        List<Document> project3Docs = new ArrayList<>();
        // Empty list for project 3
        
        when(documentRepository.findByProjectId(1L)).thenReturn(project1Docs);
        when(documentRepository.findByProjectId(2L)).thenReturn(project2Docs);
        when(documentRepository.findByProjectId(3L)).thenReturn(project3Docs);
        
        // When
        Map<Long, Integer> result = projectService.getDocumentCountsByProjectIds(projectIds);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsEntry(1L, 2);
        assertThat(result).containsEntry(2L, 1);
        assertThat(result).containsEntry(3L, 0);
        
        // Verify document repository was called for each project ID
        verify(documentRepository, times(1)).findByProjectId(1L);
        verify(documentRepository, times(1)).findByProjectId(2L);
        verify(documentRepository, times(1)).findByProjectId(3L);
    }
    
    @Test
    @WithMockUser(authorities = {"ROLE_DIRECTOR"})
    void deleteProject_asDirector_shouldDeleteProject() {
        // Given
        Long projectId = 1L;
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        
        // When
        projectService.deleteProject(projectId);
        
        // Then
        verify(projectMemberRepository, times(1)).deleteByProjectId(projectId);
        verify(projectRepository, times(1)).delete(testProject);
    }
    
    @Test
    @WithMockUser(authorities = {"ROLE_PROJECT_MANAGER"})
    void deleteProject_asProjectManager_shouldThrowAccessDeniedException() {
        // Given
        Long projectId = 1L;
        
        // When/Then
        assertThatThrownBy(() -> projectService.deleteProject(projectId))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessageContaining("Only directors can delete projects");
        
        verify(projectRepository, never()).delete(any(Project.class));
        verify(projectMemberRepository, never()).deleteByProjectId(anyLong());
    }
} 