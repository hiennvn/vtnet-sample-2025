package com.vtnet.pdms.application.service;

import com.vtnet.pdms.application.dto.ProjectMemberCreateDTO;
import com.vtnet.pdms.application.dto.ProjectMemberDTO;
import com.vtnet.pdms.application.dto.ProjectMemberUpdateDTO;
import com.vtnet.pdms.application.mapper.ProjectMemberMapper;
import com.vtnet.pdms.domain.model.Project;
import com.vtnet.pdms.domain.model.ProjectMember;
import com.vtnet.pdms.domain.model.User;
import com.vtnet.pdms.domain.repository.ProjectMemberRepository;
import com.vtnet.pdms.domain.repository.ProjectRepository;
import com.vtnet.pdms.domain.repository.UserRepository;
import com.vtnet.pdms.infrastructure.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectMemberServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    @Mock
    private ProjectMemberMapper projectMemberMapper;

    @InjectMocks
    private ProjectMemberServiceImpl projectMemberService;

    private User testUser;
    private User testUser2;
    private Project testProject;
    private ProjectMember testMember;
    private ProjectMemberDTO testMemberDTO;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");

        testUser2 = new User();
        testUser2.setId(2L);
        testUser2.setName("Test User 2");
        testUser2.setEmail("test2@example.com");

        testProject = new Project("Test Project", Project.STATUS_ACTIVE, testUser);
        testProject.setId(1L);

        testMember = new ProjectMember(testProject, testUser, "PROJECT_MANAGER", testUser);
        
        testMemberDTO = new ProjectMemberDTO(
                testUser.getId(),
                testUser.getName(),
                testUser.getEmail(),
                "PROJECT_MANAGER",
                LocalDateTime.now()
        );
    }

    @Test
    void getProjectMembers_shouldReturnMembers() {
        // Given
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(projectMemberRepository.findByProjectId(1L)).thenReturn(List.of(testMember));
        when(projectMemberMapper.toDtoList(List.of(testMember))).thenReturn(List.of(testMemberDTO));

        // When
        List<ProjectMemberDTO> result = projectMemberService.getProjectMembers(1L);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(testUser.getId());
        verify(projectMemberRepository).findByProjectId(1L);
        verify(projectMemberMapper).toDtoList(List.of(testMember));
    }

    @Test
    void addProjectMember_shouldAddMember() {
        // Given
        ProjectMemberCreateDTO createDTO = new ProjectMemberCreateDTO(2L, "DEVELOPER");
        
        try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
            securityUtils.when(SecurityUtils::getCurrentUserLogin).thenReturn(Optional.of("test@example.com"));
            
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
            when(userRepository.findById(2L)).thenReturn(Optional.of(testUser2));
            when(projectMemberRepository.existsByProjectIdAndUserId(1L, 2L)).thenReturn(false);
            when(projectMemberMapper.toDto(any(ProjectMember.class))).thenReturn(testMemberDTO);

            // When
            ProjectMemberDTO result = projectMemberService.addProjectMember(1L, createDTO);

            // Then
            assertThat(result).isNotNull();
            verify(projectMemberRepository).save(any(ProjectMember.class));
            verify(projectMemberMapper).toDto(any(ProjectMember.class));
        }
    }

    @Test
    void addProjectMember_shouldThrowException_whenUserAlreadyMember() {
        // Given
        ProjectMemberCreateDTO createDTO = new ProjectMemberCreateDTO(2L, "DEVELOPER");
        
        try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
            securityUtils.when(SecurityUtils::getCurrentUserLogin).thenReturn(Optional.of("test@example.com"));
            
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
            when(userRepository.findById(2L)).thenReturn(Optional.of(testUser2));
            when(projectMemberRepository.existsByProjectIdAndUserId(1L, 2L)).thenReturn(true);

            // When/Then
            assertThatThrownBy(() -> projectMemberService.addProjectMember(1L, createDTO))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("User is already a member of this project");
            
            verify(projectMemberRepository, never()).save(any(ProjectMember.class));
        }
    }

    @Test
    void updateProjectMember_shouldUpdateRole() {
        // Given
        ProjectMemberUpdateDTO updateDTO = new ProjectMemberUpdateDTO("DEVELOPER");
        
        when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L)).thenReturn(Optional.of(testMember));
        when(projectMemberMapper.toDto(testMember)).thenReturn(testMemberDTO);

        // When
        ProjectMemberDTO result = projectMemberService.updateProjectMember(1L, 1L, updateDTO);

        // Then
        assertThat(result).isNotNull();
        verify(projectMemberRepository).save(testMember);
        assertThat(testMember.getRole()).isEqualTo("DEVELOPER");
    }

    @Test
    void updateProjectMember_shouldThrowException_whenLastProjectManager() {
        // Given
        ProjectMemberUpdateDTO updateDTO = new ProjectMemberUpdateDTO("DEVELOPER");
        
        when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L)).thenReturn(Optional.of(testMember));
        when(projectMemberRepository.countByProjectIdAndRole(1L, "PROJECT_MANAGER")).thenReturn(1L);

        // When/Then
        assertThatThrownBy(() -> projectMemberService.updateProjectMember(1L, 1L, updateDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot remove the last project manager");
        
        verify(projectMemberRepository, never()).save(any(ProjectMember.class));
    }

    @Test
    void removeProjectMember_shouldRemoveMember() {
        // Given
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L)).thenReturn(Optional.of(testMember));
        when(projectMemberRepository.countByProjectIdAndRole(1L, "PROJECT_MANAGER")).thenReturn(2L);

        // When
        projectMemberService.removeProjectMember(1L, 1L);

        // Then
        verify(projectMemberRepository).delete(testMember);
    }

    @Test
    void removeProjectMember_shouldThrowException_whenLastProjectManager() {
        // Given
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L)).thenReturn(Optional.of(testMember));
        when(projectMemberRepository.countByProjectIdAndRole(1L, "PROJECT_MANAGER")).thenReturn(1L);

        // When/Then
        assertThatThrownBy(() -> projectMemberService.removeProjectMember(1L, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot remove the last project manager");
        
        verify(projectMemberRepository, never()).delete(any(ProjectMember.class));
    }

    @Test
    void getUsersNotInProject_shouldReturnUsers() {
        // Given
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(projectMemberRepository.findUsersNotInProject(1L)).thenReturn(List.of(testUser2));

        // When
        List<User> result = projectMemberService.getUsersNotInProject(1L);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(testUser2.getId());
    }

    @Test
    void isUserProjectMember_shouldReturnTrue_whenUserIsMember() {
        // Given
        when(projectMemberRepository.existsByProjectIdAndUserId(1L, 1L)).thenReturn(true);

        // When
        boolean result = projectMemberService.isUserProjectMember(1L, 1L);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void hasUserProjectRole_shouldReturnTrue_whenUserHasRole() {
        // Given
        when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L)).thenReturn(Optional.of(testMember));

        // When
        boolean result = projectMemberService.hasUserProjectRole(1L, 1L, "PROJECT_MANAGER");

        // Then
        assertThat(result).isTrue();
    }
} 