package com.teamtaskmanager.service;

import com.teamtaskmanager.dto.AuthDtos;
import com.teamtaskmanager.entity.Project;
import com.teamtaskmanager.entity.Task;
import com.teamtaskmanager.entity.User;
import com.teamtaskmanager.enums.Role;
import com.teamtaskmanager.enums.TaskStatus;
import com.teamtaskmanager.repository.ProjectRepository;
import com.teamtaskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public DashboardService(TaskRepository taskRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    public AuthDtos.DashboardResponse getDashboard(User currentUser) {
        AuthDtos.DashboardResponse response = new AuthDtos.DashboardResponse();
        List<Task> scopeTasks;
        if (currentUser.getRole() == Role.ADMIN) {
            scopeTasks = taskRepository.findAll();
        } else {
            scopeTasks = taskRepository.findByAssignedToId(currentUser.getId());
        }
        response.setTotalTasks(scopeTasks.size());

        Map<String, Long> byStatus = new HashMap<>();
        byStatus.put(TaskStatus.TODO.name(), scopeTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count());
        byStatus.put(TaskStatus.IN_PROGRESS.name(), scopeTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count());
        byStatus.put(TaskStatus.DONE.name(), scopeTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count());
        response.setTasksByStatus(byStatus);

        response.setOverdueTasksCount(scopeTasks.stream()
                .filter(task -> task.getDueDate().isBefore(LocalDate.now()) && task.getStatus() != TaskStatus.DONE)
                .count());

        List<AuthDtos.TaskSummary> myTasks = scopeTasks
                .stream()
                .map(this::toSummary)
                .toList();
        response.setMyAssignedTasks(myTasks);
        List<Project> projects = currentUser.getRole() == Role.ADMIN
                ? projectRepository.findAll()
                : projectRepository.findByMembersContaining(currentUser);
        response.setProjectCount(projects.size());
        return response;
    }

    private AuthDtos.TaskSummary toSummary(Task task) {
        AuthDtos.TaskSummary summary = new AuthDtos.TaskSummary();
        summary.setId(task.getId());
        summary.setTitle(task.getTitle());
        summary.setStatus(task.getStatus());
        summary.setPriority(task.getPriority());
        summary.setDueDate(task.getDueDate());
        summary.setProjectId(task.getProject().getId());
        summary.setProjectName(task.getProject().getName());
        summary.setAssignedToId(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null);
        summary.setAssignedToName(task.getAssignedTo() != null ? task.getAssignedTo().getName() : "Unassigned");
        return summary;
    }
}
