package com.teamtaskmanager.service;

import com.teamtaskmanager.dto.AuthDtos;
import com.teamtaskmanager.entity.Project;
import com.teamtaskmanager.entity.Task;
import com.teamtaskmanager.entity.User;
import com.teamtaskmanager.enums.Role;
import com.teamtaskmanager.enums.TaskStatus;
import com.teamtaskmanager.exception.ApiException;
import com.teamtaskmanager.repository.ProjectRepository;
import com.teamtaskmanager.repository.TaskRepository;
import com.teamtaskmanager.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.List;
import java.util.Set;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public Task createTask(AuthDtos.TaskRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ApiException("Project not found", HttpStatus.NOT_FOUND));
        if (request.getDueDate().isBefore(LocalDate.now())) {
            throw new ApiException("Task due date cannot be in the past", HttpStatus.BAD_REQUEST);
        }
        Task task = new Task();
        mapTask(task, request);
        task.setProject(project);
        validateAssignment(task.getAssignedTo(), project);
        return taskRepository.save(task);
    }

    public List<Task> getByProject(Long projectId, User actor) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException("Project not found", HttpStatus.NOT_FOUND));
        if (actor.getRole() == Role.ADMIN) {
            return taskRepository.findByProjectId(projectId);
        }
        boolean member = project.getMembers().stream().anyMatch(user -> user.getId().equals(actor.getId()));
        if (!member) {
            throw new ApiException("You don't have permission for this action", HttpStatus.FORBIDDEN);
        }
        return taskRepository.findByAssignedToIdAndProjectId(actor.getId(), projectId);
    }

    public Task updateTask(Long id, AuthDtos.TaskRequest request, User actor) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ApiException("Task not found", HttpStatus.NOT_FOUND));
        if (actor.getRole() == Role.MEMBER) {
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(actor.getId())) {
                throw new ApiException("You don't have permission for this action", HttpStatus.FORBIDDEN);
            }
            TaskStatus current = task.getStatus();
            TaskStatus next = request.getStatus();
            Map<TaskStatus, Set<TaskStatus>> transitions = Map.of(
                    TaskStatus.TODO, Set.of(TaskStatus.IN_PROGRESS),
                    TaskStatus.IN_PROGRESS, Set.of(TaskStatus.DONE),
                    TaskStatus.DONE, Set.of(TaskStatus.DONE)
            );
            if (!transitions.getOrDefault(current, Set.of()).contains(next)) {
                throw new ApiException("Invalid status transition", HttpStatus.BAD_REQUEST);
            }
            task.setStatus(request.getStatus());
        } else {
            if (request.getDueDate().isBefore(LocalDate.now())) {
                throw new ApiException("Task due date cannot be in the past", HttpStatus.BAD_REQUEST);
            }
            mapTask(task, request);
            if (!task.getProject().getId().equals(request.getProjectId())) {
                Project project = projectRepository.findById(request.getProjectId())
                        .orElseThrow(() -> new ApiException("Project not found", HttpStatus.NOT_FOUND));
                task.setProject(project);
            }
            validateAssignment(task.getAssignedTo(), task.getProject());
        }
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ApiException("Task not found", HttpStatus.NOT_FOUND);
        }
        taskRepository.deleteById(id);
    }

    public List<Task> overdueTasks() {
        return taskRepository.findByDueDateBeforeAndStatusNot(LocalDate.now(), TaskStatus.DONE);
    }

    public List<Task> overdueTasks(User actor) {
        if (actor.getRole() == Role.ADMIN) {
            return overdueTasks();
        }
        return taskRepository.findByAssignedToAndDueDateBeforeAndStatusNot(actor, LocalDate.now(), TaskStatus.DONE);
    }

    public List<Task> assignedTo(User actor) {
        return taskRepository.findByAssignedToId(actor.getId());
    }

    private void mapTask(Task task, AuthDtos.TaskRequest request) {
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        if (request.getAssignedToId() != null) {
            User assignedUser = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ApiException("Assigned user not found", HttpStatus.NOT_FOUND));
            task.setAssignedTo(assignedUser);
        } else {
            task.setAssignedTo(null);
        }
    }

    private void validateAssignment(User assignedTo, Project project) {
        if (assignedTo == null) {
            return;
        }
        if (assignedTo.getRole() != Role.MEMBER) {
            throw new ApiException("Cannot assign tasks to admin users", HttpStatus.BAD_REQUEST);
        }
        boolean isMember = project.getMembers().stream().anyMatch(member -> member.getId().equals(assignedTo.getId()));
        if (!isMember) {
            throw new ApiException("Assigned user must be a member of the project", HttpStatus.BAD_REQUEST);
        }
    }

    public Task unassignTask(Long taskId, User actor) {
        if (actor.getRole() != Role.ADMIN) {
            throw new ApiException("You don't have permission for this action", HttpStatus.FORBIDDEN);
        }
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ApiException("Task not found", HttpStatus.NOT_FOUND));
        task.setAssignedTo(null);
        return taskRepository.save(task);
    }
}
