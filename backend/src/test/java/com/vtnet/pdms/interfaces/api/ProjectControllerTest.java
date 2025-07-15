package com.vtnet.pdms.interfaces.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vtnet.pdms.application.dto.ProjectListDTO;
import com.vtnet.pdms.domain.model.Project;
import com.vtnet.pdms.domain.service.ProjectService;
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
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProjectControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProjectService projectService;

    @InjectMocks
    private ProjectController projectController;

    private ProjectListDTO testProjectDto;
    private Page<ProjectListDTO> projectDtoPage;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // Setup ObjectMapper
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules(); // Register modules for LocalDateTime serialization
        
        // Setup MockMvc
        mockMvc = MockMvcBuilders.standaloneSetup(projectController)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
                
        // Setup test data
        testProjectDto = new ProjectListDTO();
        testProjectDto.setId(1L);
        testProjectDto.setName("Test Project");
        testProjectDto.setStatus(Project.STATUS_ACTIVE);
        testProjectDto.setDocumentCount(5);
        testProjectDto.setCreatedAt(LocalDateTime.now());
        
        List<ProjectListDTO> projectDtos = List.of(testProjectDto);
        projectDtoPage = new PageImpl<>(projectDtos, PageRequest.of(0, 10), 1);
    }

    @Test
    void getAllProjects_shouldReturnProjects() throws Exception {
        // Given
        when(projectService.getAllProjects(any(Pageable.class))).thenReturn(projectDtoPage);

        // When/Then
        mockMvc.perform(get("/projects")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id").value(testProjectDto.getId()))
                .andExpect(jsonPath("$.content[0].name").value(testProjectDto.getName()))
                .andExpect(jsonPath("$.content[0].status").value(testProjectDto.getStatus()))
                .andExpect(jsonPath("$.content[0].documentCount").value(testProjectDto.getDocumentCount()));
    }

    @Test
    void getAllProjects_withStatusFilter_shouldReturnFilteredProjects() throws Exception {
        // Given
        when(projectService.getProjectsByStatus(eq(Project.STATUS_ACTIVE), any(Pageable.class)))
                .thenReturn(projectDtoPage);

        // When/Then
        mockMvc.perform(get("/projects")
                .param("status", Project.STATUS_ACTIVE)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].status").value(Project.STATUS_ACTIVE));
    }

    @Test
    void getAllProjects_withNameFilter_shouldReturnFilteredProjects() throws Exception {
        // Given
        String searchTerm = "Test";
        when(projectService.getProjectsByNameContaining(eq(searchTerm), any(Pageable.class)))
                .thenReturn(projectDtoPage);

        // When/Then
        mockMvc.perform(get("/projects")
                .param("name", searchTerm)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name").value(testProjectDto.getName()));
    }
    
    @Test
    void deleteProject_shouldDeleteProjectAndReturnNoContent() throws Exception {
        // Given
        Long projectId = 1L;
        doNothing().when(projectService).deleteProject(projectId);
        
        // When/Then
        mockMvc.perform(delete("/projects/{id}", projectId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
        
        verify(projectService, times(1)).deleteProject(projectId);
    }
} 