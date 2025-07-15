package com.vtnet.pdms.interfaces.api;

import com.vtnet.pdms.application.dto.ProjectMemberCreateDTO;
import com.vtnet.pdms.application.dto.ProjectMemberDTO;
import com.vtnet.pdms.application.dto.ProjectMemberUpdateDTO;
import com.vtnet.pdms.application.dto.UserResponseDTO;
import com.vtnet.pdms.application.mapper.UserMapper;
import com.vtnet.pdms.domain.model.User;
import com.vtnet.pdms.domain.service.ProjectMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing project members.
 */
@RestController
@RequestMapping("/projects/{projectId}/members")
@Tag(name = "Project Members", description = "Project member management APIs")
@SecurityRequirement(name = "bearerAuth")
public class ProjectMemberController {

    private static final Logger logger = LoggerFactory.getLogger(ProjectMemberController.class);

    private final ProjectMemberService projectMemberService;
    private final UserMapper userMapper;

    /**
     * Constructor with dependency injection.
     *
     * @param projectMemberService Service for project member operations
     * @param userMapper Mapper for user entity-DTO conversion
     */
    @Autowired
    public ProjectMemberController(ProjectMemberService projectMemberService, UserMapper userMapper) {
        this.projectMemberService = projectMemberService;
        this.userMapper = userMapper;
    }

    /**
     * GET /projects/{projectId}/members : Get all members of a project.
     *
     * @param projectId The project ID
     * @return List of project members
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    @Operation(
        summary = "Get all members of a project",
        description = "Get all members of a project by project ID",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectMemberDTO.class))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Project not found")
        }
    )
    public ResponseEntity<List<ProjectMemberDTO>> getProjectMembers(@PathVariable Long projectId) {
        logger.info("REST request to get all members of project ID: {}", projectId);
        List<ProjectMemberDTO> members = projectMemberService.getProjectMembers(projectId);
        return ResponseEntity.ok(members);
    }

    /**
     * POST /projects/{projectId}/members : Add a member to a project.
     *
     * @param projectId The project ID
     * @param memberCreateDTO The member data
     * @return The added project member
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    @Operation(
        summary = "Add a member to a project",
        description = "Add a member to a project with the specified role",
        responses = {
            @ApiResponse(
                responseCode = "201",
                description = "Member added successfully",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectMemberDTO.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Project or user not found"),
            @ApiResponse(responseCode = "409", description = "User is already a member of this project")
        }
    )
    public ResponseEntity<ProjectMemberDTO> addProjectMember(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectMemberCreateDTO memberCreateDTO) {
        logger.info("REST request to add member to project ID: {}", projectId);
        ProjectMemberDTO member = projectMemberService.addProjectMember(projectId, memberCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    /**
     * PUT /projects/{projectId}/members/{userId} : Update a project member's role.
     *
     * @param projectId The project ID
     * @param userId The user ID
     * @param memberUpdateDTO The updated member data
     * @return The updated project member
     */
    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    @Operation(
        summary = "Update a project member's role",
        description = "Update a project member's role in the project",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Member updated successfully",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectMemberDTO.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Project member not found")
        }
    )
    public ResponseEntity<ProjectMemberDTO> updateProjectMember(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @Valid @RequestBody ProjectMemberUpdateDTO memberUpdateDTO) {
        logger.info("REST request to update member role for user ID: {} in project ID: {}", userId, projectId);
        ProjectMemberDTO member = projectMemberService.updateProjectMember(projectId, userId, memberUpdateDTO);
        return ResponseEntity.ok(member);
    }

    /**
     * DELETE /projects/{projectId}/members/{userId} : Remove a member from a project.
     *
     * @param projectId The project ID
     * @param userId The user ID
     * @return No content
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    @Operation(
        summary = "Remove a member from a project",
        description = "Remove a member from a project",
        responses = {
            @ApiResponse(responseCode = "204", description = "Member removed successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Project or member not found")
        }
    )
    public ResponseEntity<Void> removeProjectMember(
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        logger.info("REST request to remove member with user ID: {} from project ID: {}", userId, projectId);
        projectMemberService.removeProjectMember(projectId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /projects/{projectId}/members/available : Get users who are not members of a project.
     *
     * @param projectId The project ID
     * @return List of users not in the project
     */
    @GetMapping("/available")
    @PreAuthorize("hasAnyAuthority('ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN')")
    @Operation(
        summary = "Get users who are not members of a project",
        description = "Get users who are not members of a project and can be added",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponseDTO.class))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Project not found")
        }
    )
    public ResponseEntity<List<UserResponseDTO>> getAvailableUsers(@PathVariable Long projectId) {
        logger.info("REST request to get users not in project ID: {}", projectId);
        List<User> users = projectMemberService.getUsersNotInProject(projectId);
        List<UserResponseDTO> userDTOs = userMapper.toDtoList(users);
        return ResponseEntity.ok(userDTOs);
    }
} 