package com.teamtaskmanager.controller;

import com.teamtaskmanager.dto.AuthDtos;
import com.teamtaskmanager.entity.Project;
import com.teamtaskmanager.entity.User;
import com.teamtaskmanager.service.ProjectService;
import com.teamtaskmanager.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projectService;
    private final UserService userService;

    public ProjectController(ProjectService projectService, UserService userService) {
        this.projectService = projectService;
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> createProject(@Valid @RequestBody AuthDtos.ProjectRequest request,
                                                 Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(projectService.createProject(request, user));
    }

    @GetMapping
    public ResponseEntity<List<Project>> listProjects(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(projectService.getProjectsForUser(user));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> addMember(@PathVariable Long id, @Valid @RequestBody AuthDtos.AddMemberRequest request) {
        return ResponseEntity.ok(projectService.addMember(id, request.getUserId()));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        return ResponseEntity.ok(projectService.removeMember(id, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuthDtos.UserProjectStatus>> usersWithStatus(@RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(projectService.usersWithProjectStatus(projectId));
    }
}
