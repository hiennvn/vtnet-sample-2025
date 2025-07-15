package com.vtnet.pdms.interfaces.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vtnet.pdms.application.dto.ProjectMemberCreateDTO;
import com.vtnet.pdms.application.dto.ProjectMemberDTO;
import com.vtnet.pdms.application.dto.ProjectMemberUpdateDTO;
import com.vtnet.pdms.domain.service.ProjectMemberService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectMemberControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProjectMemberService projectMemberService;

    @Test
    @WithMockUser(authorities = {"ROLE_DIRECTOR"})
    void getProjectMembers_shouldReturnMembers() throws Exception {
        // Given
        ProjectMemberDTO memberDTO = new ProjectMemberDTO(
                1L,
                "Test User",
                "test@example.com",
                "PROJECT_MANAGER",
                LocalDateTime.now()
        );
        when(projectMemberService.getProjectMembers(1L)).thenReturn(List.of(memberDTO));

        // When/Then
        mockMvc.perform(get("/projects/1/members"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].userId").value(memberDTO.getUserId()))
                .andExpect(jsonPath("$[0].userName").value(memberDTO.getUserName()))
                .andExpect(jsonPath("$[0].role").value(memberDTO.getRole()));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_DIRECTOR"})
    void addProjectMember_shouldAddMember() throws Exception {
        // Given
        ProjectMemberCreateDTO createDTO = new ProjectMemberCreateDTO(1L, "DEVELOPER");
        ProjectMemberDTO memberDTO = new ProjectMemberDTO(
                1L,
                "Test User",
                "test@example.com",
                "DEVELOPER",
                LocalDateTime.now()
        );
        when(projectMemberService.addProjectMember(eq(1L), any(ProjectMemberCreateDTO.class)))
                .thenReturn(memberDTO);

        // When/Then
        mockMvc.perform(post("/projects/1/members")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.userId").value(memberDTO.getUserId()))
                .andExpect(jsonPath("$.userName").value(memberDTO.getUserName()))
                .andExpect(jsonPath("$.role").value(memberDTO.getRole()));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_PROJECT_MANAGER"})
    void updateProjectMember_shouldUpdateMember() throws Exception {
        // Given
        ProjectMemberUpdateDTO updateDTO = new ProjectMemberUpdateDTO("DESIGNER");
        ProjectMemberDTO memberDTO = new ProjectMemberDTO(
                1L,
                "Test User",
                "test@example.com",
                "DESIGNER",
                LocalDateTime.now()
        );
        when(projectMemberService.updateProjectMember(eq(1L), eq(1L), any(ProjectMemberUpdateDTO.class)))
                .thenReturn(memberDTO);

        // When/Then
        mockMvc.perform(put("/projects/1/members/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.userId").value(memberDTO.getUserId()))
                .andExpect(jsonPath("$.userName").value(memberDTO.getUserName()))
                .andExpect(jsonPath("$.role").value(memberDTO.getRole()));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_USER"})
    void getProjectMembers_shouldReturn403_whenNotAuthorized() throws Exception {
        mockMvc.perform(get("/projects/1/members"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getProjectMembers_shouldReturn401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/projects/1/members"))
                .andExpect(status().isUnauthorized());
    }
} 