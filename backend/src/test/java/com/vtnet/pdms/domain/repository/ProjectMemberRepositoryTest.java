package com.vtnet.pdms.domain.repository;

import com.vtnet.pdms.domain.model.Project;
import com.vtnet.pdms.domain.model.ProjectMember;
import com.vtnet.pdms.domain.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ProjectMemberRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private User user1;
    private User user2;
    private User user3;
    private Project project;
    private ProjectMember projectMember1;
    private ProjectMember projectMember2;

    @BeforeEach
    void setUp() {
        // Create test users
        user1 = new User();
        user1.setName("Test User 1");
        user1.setEmail("user1@example.com");
        user1.setPasswordHash("password");
        entityManager.persist(user1);

        user2 = new User();
        user2.setName("Test User 2");
        user2.setEmail("user2@example.com");
        user2.setPasswordHash("password");
        entityManager.persist(user2);

        user3 = new User();
        user3.setName("Test User 3");
        user3.setEmail("user3@example.com");
        user3.setPasswordHash("password");
        entityManager.persist(user3);

        // Create test project
        project = new Project("Test Project", Project.STATUS_ACTIVE, user1);
        entityManager.persist(project);

        // Create project members
        projectMember1 = project.addMember(user1, "PROJECT_MANAGER", user1);
        entityManager.persist(projectMember1);

        projectMember2 = project.addMember(user2, "DEVELOPER", user1);
        entityManager.persist(projectMember2);

        entityManager.flush();
    }

    @Test
    void findByProjectId_shouldReturnAllProjectMembers() {
        // When
        List<ProjectMember> members = projectMemberRepository.findByProjectId(project.getId());

        // Then
        assertThat(members).hasSize(2);
        assertThat(members).extracting(member -> member.getUser().getId())
                .containsExactlyInAnyOrder(user1.getId(), user2.getId());
    }

    @Test
    void findByProjectIdAndUserId_shouldReturnMember() {
        // When
        Optional<ProjectMember> member = projectMemberRepository.findByProjectIdAndUserId(
                project.getId(), user1.getId());

        // Then
        assertThat(member).isPresent();
        assertThat(member.get().getUser().getId()).isEqualTo(user1.getId());
        assertThat(member.get().getRole()).isEqualTo("PROJECT_MANAGER");
    }

    @Test
    void existsByProjectIdAndUserId_shouldReturnTrue_whenUserIsMember() {
        // When
        boolean exists = projectMemberRepository.existsByProjectIdAndUserId(
                project.getId(), user1.getId());

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void existsByProjectIdAndUserId_shouldReturnFalse_whenUserIsNotMember() {
        // When
        boolean exists = projectMemberRepository.existsByProjectIdAndUserId(
                project.getId(), user3.getId());

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void findUsersNotInProject_shouldReturnNonMembers() {
        // When
        List<User> nonMembers = projectMemberRepository.findUsersNotInProject(project.getId());

        // Then
        assertThat(nonMembers).hasSize(1);
        assertThat(nonMembers.get(0).getId()).isEqualTo(user3.getId());
    }

    @Test
    void countByProjectIdAndRole_shouldReturnCorrectCount() {
        // When
        long managerCount = projectMemberRepository.countByProjectIdAndRole(
                project.getId(), "PROJECT_MANAGER");
        long developerCount = projectMemberRepository.countByProjectIdAndRole(
                project.getId(), "DEVELOPER");
        long designerCount = projectMemberRepository.countByProjectIdAndRole(
                project.getId(), "DESIGNER");

        // Then
        assertThat(managerCount).isEqualTo(1);
        assertThat(developerCount).isEqualTo(1);
        assertThat(designerCount).isEqualTo(0);
    }
} 