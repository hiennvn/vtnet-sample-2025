package com.vtnet.pdms.interfaces.api;

import com.vtnet.pdms.TestConfig;
import com.vtnet.pdms.application.dto.ProjectListDTO;
import com.vtnet.pdms.domain.model.Project;
import com.vtnet.pdms.domain.service.ProjectService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestConfig.class)
class ProjectControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProjectService projectService;

    @Test
    @WithMockUser(authorities = {"ROLE_DIRECTOR"})
    void getAllProjects_asDirector_shouldReturnAllProjects() throws Exception {
        // Setup test data
        ProjectListDTO project1 = new ProjectListDTO(1L, "Active Project", Project.STATUS_ACTIVE, 5, LocalDateTime.now());
        ProjectListDTO project2 = new ProjectListDTO(2L, "Completed Project", Project.STATUS_COMPLETED, 3, LocalDateTime.now());
        
        List<ProjectListDTO> projects = List.of(project1, project2);
        Page<ProjectListDTO> projectPage = new PageImpl<>(projects, PageRequest.of(0, 10), projects.size());
        
        when(projectService.getAllProjects(any(Pageable.class))).thenReturn(projectPage);

        // Execute and verify
        mockMvc.perform(get("/projects")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements", is(2)));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_DIRECTOR"})
    void getAllProjects_withStatusFilter_shouldReturnFilteredProjects() throws Exception {
        // Setup test data
        ProjectListDTO project = new ProjectListDTO(1L, "Active Project", Project.STATUS_ACTIVE, 5, LocalDateTime.now());
        
        List<ProjectListDTO> projects = List.of(project);
        Page<ProjectListDTO> projectPage = new PageImpl<>(projects, PageRequest.of(0, 10), projects.size());
        
        when(projectService.getProjectsByStatus(eq(Project.STATUS_ACTIVE), any(Pageable.class)))
                .thenReturn(projectPage);

        // Execute and verify
        mockMvc.perform(get("/projects")
                .param("status", Project.STATUS_ACTIVE)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].status", is(Project.STATUS_ACTIVE)));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_DIRECTOR"})
    void getAllProjects_withNameFilter_shouldReturnFilteredProjects() throws Exception {
        // Setup test data
        ProjectListDTO project = new ProjectListDTO(1L, "Active Project", Project.STATUS_ACTIVE, 5, LocalDateTime.now());
        
        List<ProjectListDTO> projects = List.of(project);
        Page<ProjectListDTO> projectPage = new PageImpl<>(projects, PageRequest.of(0, 10), projects.size());
        
        String searchTerm = "Active";
        when(projectService.getProjectsByNameContaining(eq(searchTerm), any(Pageable.class)))
                .thenReturn(projectPage);

        // Execute and verify
        mockMvc.perform(get("/projects")
                .param("name", searchTerm)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", is("Active Project")));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_TEAM_MEMBER"})
    void getAllProjects_asTeamMember_shouldReturnAllProjects() throws Exception {
        // Setup test data
        ProjectListDTO project = new ProjectListDTO(1L, "Active Project", Project.STATUS_ACTIVE, 5, LocalDateTime.now());
        
        List<ProjectListDTO> projects = List.of(project);
        Page<ProjectListDTO> projectPage = new PageImpl<>(projects, PageRequest.of(0, 10), projects.size());
        
        when(projectService.getAllProjects(any(Pageable.class))).thenReturn(projectPage);

        // Execute and verify
        mockMvc.perform(get("/projects")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
    }

    @Test
    void getAllProjects_withoutAuthentication_shouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/projects")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
    
    @Test
    @WithMockUser(authorities = {"ROLE_DIRECTOR"})
    void deleteProject_asDirector_shouldDeleteProject() throws Exception {
        // Setup
        Long projectId = 1L;
        doNothing().when(projectService).deleteProject(projectId);
        
        // Execute and verify
        mockMvc.perform(delete("/projects/{id}", projectId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
        
        verify(projectService, times(1)).deleteProject(projectId);
    }
    
    @Test
    @WithMockUser(authorities = {"ROLE_PROJECT_MANAGER"})
    void deleteProject_asProjectManager_shouldReturnForbidden() throws Exception {
        // Execute and verify
        mockMvc.perform(delete("/projects/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
        
        verify(projectService, times(0)).deleteProject(anyLong());
    }
    
    @Test
    void deleteProject_withoutAuthentication_shouldReturnForbidden() throws Exception {
        mockMvc.perform(delete("/projects/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
        
        verify(projectService, times(0)).deleteProject(anyLong());
    }
} 