package com.vtnet.pdms.domain.repository;

import com.vtnet.pdms.domain.model.Project;
import com.vtnet.pdms.domain.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ProjectRepositoryTest {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setup() {
        // Create a test user
        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("password_hash");
        testUser = userRepository.save(testUser);

        // Clear any existing projects
        projectRepository.deleteAll();

        // Create test projects with different statuses
        Project activeProject1 = new Project("Active Project 1", Project.STATUS_ACTIVE, testUser);
        Project activeProject2 = new Project("Active Project 2", Project.STATUS_ACTIVE, testUser);
        Project completedProject = new Project("Completed Project", Project.STATUS_COMPLETED, testUser);
        Project archivedProject = new Project("Archived Project", Project.STATUS_ARCHIVED, testUser);

        projectRepository.saveAll(List.of(activeProject1, activeProject2, completedProject, archivedProject));
    }

    @Test
    void findByStatus_shouldReturnProjectsWithSpecifiedStatus() {
        // When
        List<Project> activeProjects = projectRepository.findByStatus(Project.STATUS_ACTIVE);
        List<Project> completedProjects = projectRepository.findByStatus(Project.STATUS_COMPLETED);
        List<Project> archivedProjects = projectRepository.findByStatus(Project.STATUS_ARCHIVED);

        // Then
        assertThat(activeProjects).hasSize(2);
        assertThat(completedProjects).hasSize(1);
        assertThat(archivedProjects).hasSize(1);

        assertThat(activeProjects)
                .extracting(Project::getStatus)
                .containsOnly(Project.STATUS_ACTIVE);
    }

    @Test
    void findByStatus_withPagination_shouldReturnPagedResult() {
        // Given
        Pageable pageable = PageRequest.of(0, 1, Sort.by("name").ascending());

        // When
        Page<Project> activePage = projectRepository.findByStatus(Project.STATUS_ACTIVE, pageable);

        // Then
        assertThat(activePage.getContent()).hasSize(1);
        assertThat(activePage.getTotalElements()).isEqualTo(2);
        assertThat(activePage.getTotalPages()).isEqualTo(2);
    }

    @Test
    void findByNameContaining_shouldReturnMatchingProjects() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Project> projectsWithActive = projectRepository.findByNameContaining("Active", pageable);
        Page<Project> projectsWithProject = projectRepository.findByNameContaining("Project", pageable);

        // Then
        assertThat(projectsWithActive.getContent()).hasSize(2);
        assertThat(projectsWithProject.getContent()).hasSize(4);
    }

    @Test
    void findAll_withPagination_shouldReturnAllProjects() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Project> allProjects = projectRepository.findAll(pageable);

        // Then
        assertThat(allProjects.getContent()).hasSize(4);
    }
} 