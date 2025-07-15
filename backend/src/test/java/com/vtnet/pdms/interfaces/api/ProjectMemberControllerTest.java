package com.vtnet.pdms.interfaces.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vtnet.pdms.application.dto.ProjectMemberCreateDTO;
import com.vtnet.pdms.application.dto.ProjectMemberDTO;
import com.vtnet.pdms.application.dto.ProjectMemberUpdateDTO;
import com.vtnet.pdms.application.dto.UserResponseDTO;
import com.vtnet.pdms.application.mapper.UserMapper;
import com.vtnet.pdms.domain.model.User;
import com.vtnet.pdms.domain.service.ProjectMemberService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProjectMemberController.class)
class ProjectMemberControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProjectMemberService projectMemberService;

    @MockBean
    private UserMapper userMapper;

    private ProjectMemberDTO testMemberDTO;
    private ProjectMemberCreateDTO testMemberCreateDTO;
    private ProjectMemberUpdateDTO testMemberUpdateDTO;
    private User testUser;
    private UserResponseDTO testUserDTO;

    @BeforeEach
    void setUp() {
        testMemberDTO = new ProjectMemberDTO(
                1L,
                "Test User",
                "test@example.com",
                "PROJECT_MANAGER",
                LocalDateTime.now()
        );

        testMemberCreateDTO = new ProjectMemberCreateDTO(1L, "DEVELOPER");
        testMemberUpdateDTO = new ProjectMemberUpdateDTO("DESIGNER");

        testUser = new User();
        testUser.setId(2L);
        testUser.setName("Available User");
        testUser.setEmail("available@example.com");

        testUserDTO = new UserResponseDTO();
        testUserDTO.setId(2L);
        testUserDTO.setName("Available User");
        testUserDTO.setEmail("available@example.com");
    }

    @Test
    @WithMockUser(authorities = {"ROLE_PROJECT_MANAGER"})
    void getProjectMembers_shouldReturnMembers() throws Exception {
        // Given
        when(projectMemberService.getProjectMembers(1L)).thenReturn(List.of(testMemberDTO));

        // When/Then
        mockMvc.perform(get("/projects/1/members"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].userId").value(testMemberDTO.getUserId()))
                .andExpect(jsonPath("$[0].userName").value(testMemberDTO.getUserName()))
                .andExpect(jsonPath("$[0].role").value(testMemberDTO.getRole()));

        verify(projectMemberService).getProjectMembers(1L);
    }

    @Test
    @WithMockUser(authorities = {"ROLE_PROJECT_MANAGER"})
    void addProjectMember_shouldAddMember() throws Exception {
        // Given
        when(projectMemberService.addProjectMember(eq(1L), any(ProjectMemberCreateDTO.class)))
                .thenReturn(testMemberDTO);

        // When/Then
        mockMvc.perform(post("/projects/1/members")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testMemberCreateDTO)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.userId").value(testMemberDTO.getUserId()))
                .andExpect(jsonPath("$.userName").value(testMemberDTO.getUserName()))
                .andExpect(jsonPath("$.role").value(testMemberDTO.getRole()));

        verify(projectMemberService).addProjectMember(eq(1L), any(ProjectMemberCreateDTO.class));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_PROJECT_MANAGER"})
    void updateProjectMember_shouldUpdateMember() throws Exception {
        // Given
        when(projectMemberService.updateProjectMember(eq(1L), eq(1L), any(ProjectMemberUpdateDTO.class)))
                .thenReturn(testMemberDTO);

        // When/Then
        mockMvc.perform(put("/projects/1/members/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testMemberUpdateDTO)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.userId").value(testMemberDTO.getUserId()))
                .andExpect(jsonPath("$.userName").value(testMemberDTO.getUserName()))
                .andExpect(jsonPath("$.role").value(testMemberDTO.getRole()));

        verify(projectMemberService).updateProjectMember(eq(1L), eq(1L), any(ProjectMemberUpdateDTO.class));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_PROJECT_MANAGER"})
    void removeProjectMember_shouldRemoveMember() throws Exception {
        // Given
        doNothing().when(projectMemberService).removeProjectMember(1L, 1L);

        // When/Then
        mockMvc.perform(delete("/projects/1/members/1")
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(projectMemberService).removeProjectMember(1L, 1L);
    }

    @Test
    @WithMockUser(authorities = {"ROLE_PROJECT_MANAGER"})
    void getAvailableUsers_shouldReturnUsers() throws Exception {
        // Given
        when(projectMemberService.getUsersNotInProject(1L)).thenReturn(List.of(testUser));
        when(userMapper.toDtoList(List.of(testUser))).thenReturn(List.of(testUserDTO));

        // When/Then
        mockMvc.perform(get("/projects/1/members/available"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(testUserDTO.getId()))
                .andExpect(jsonPath("$[0].name").value(testUserDTO.getName()))
                .andExpect(jsonPath("$[0].email").value(testUserDTO.getEmail()));

        verify(projectMemberService).getUsersNotInProject(1L);
        verify(userMapper).toDtoList(List.of(testUser));
    }

    @Test
    void getProjectMembers_shouldReturn401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/projects/1/members"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(projectMemberService);
    }

    @Test
    @WithMockUser(authorities = {"ROLE_USER"})
    void getProjectMembers_shouldReturn403_whenNotAuthorized() throws Exception {
        mockMvc.perform(get("/projects/1/members"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(projectMemberService);
    }
} 