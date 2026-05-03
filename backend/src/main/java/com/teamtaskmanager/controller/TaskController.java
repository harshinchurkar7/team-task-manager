package com.teamtaskmanager.controller;

import com.teamtaskmanager.dto.AuthDtos;
import com.teamtaskmanager.entity.Task;
import com.teamtaskmanager.entity.User;
import com.teamtaskmanager.service.TaskService;
import com.teamtaskmanager.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;
    private final UserService userService;

    public TaskController(TaskService taskService, UserService userService) {
        this.taskService = taskService;
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> createTask(@Valid @RequestBody AuthDtos.TaskRequest request) {
        return ResponseEntity.ok(taskService.createTask(request));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getProjectTasks(@PathVariable Long projectId, Authentication authentication) {
        User actor = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(taskService.getByProject(projectId, actor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @Valid @RequestBody AuthDtos.TaskRequest request,
                                           Authentication authentication) {
        User actor = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(taskService.updateTask(id, request, actor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/unassign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> unassignTask(@PathVariable Long id, Authentication authentication) {
        User actor = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(taskService.unassignTask(id, actor));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<Task>> overdueTasks(Authentication authentication) {
        User actor = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(taskService.overdueTasks(actor));
    }

    @GetMapping("/assigned/me")
    public ResponseEntity<List<Task>> myAssignedTasks(Authentication authentication) {
        User actor = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(taskService.assignedTo(actor));
    }
}
