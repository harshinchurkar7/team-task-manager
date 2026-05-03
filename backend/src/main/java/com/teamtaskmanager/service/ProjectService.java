package com.teamtaskmanager.service;

import com.teamtaskmanager.dto.AuthDtos;
import com.teamtaskmanager.entity.Project;
import com.teamtaskmanager.entity.Task;
import com.teamtaskmanager.entity.User;
import com.teamtaskmanager.enums.Role;
import com.teamtaskmanager.exception.ApiException;
import com.teamtaskmanager.repository.ProjectRepository;
import com.teamtaskmanager.repository.TaskRepository;
import com.teamtaskmanager.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    public Project createProject(AuthDtos.ProjectRequest request, User creator) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setCreatedBy(creator);
        List<User> members = new ArrayList<>();
        members.add(creator);
        if (request.getMemberIds() != null) {
            for (Long memberId : request.getMemberIds()) {
                if (memberId == null || Objects.equals(memberId, creator.getId())) {
                    continue;
                }
                User member = userRepository.findById(memberId)
                        .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
                if (member.getRole() != Role.MEMBER) {
                    throw new ApiException("Only members with role MEMBER can be added to a project", HttpStatus.BAD_REQUEST);
                }
                if (members.stream().noneMatch(user -> Objects.equals(user.getId(), member.getId()))) {
                    members.add(member);
                }
            }
        }
        project.setMembers(members);
        return projectRepository.save(project);
    }

    public List<Project> getProjectsForUser(User user) {
        if (user.getRole() == Role.ADMIN) {
            return projectRepository.findAll();
        }
        return projectRepository.findByMembersContaining(user);
    }

    public Project addMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException("Project not found", HttpStatus.NOT_FOUND));
        User member = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        if (member.getRole() != Role.MEMBER) {
            throw new ApiException("Only members with role MEMBER can be added to a project", HttpStatus.BAD_REQUEST);
        }
        boolean exists = project.getMembers().stream().anyMatch(m -> m.getId().equals(userId));
        if (!exists) {
            project.getMembers().add(member);
        }
        return projectRepository.save(project);
    }

    public Project removeMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException("Project not found", HttpStatus.NOT_FOUND));
        User member = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        if (project.getCreatedBy().getId().equals(userId)) {
            throw new ApiException("Cannot remove project creator", HttpStatus.BAD_REQUEST);
        }
        project.setMembers(new ArrayList<>(project.getMembers().stream()
                .filter(u -> !u.getId().equals(userId))
                .toList()));
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        for (Task task : tasks) {
            if (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(member.getId())) {
                task.setAssignedTo(null);
            }
        }
        taskRepository.saveAll(tasks);
        return projectRepository.save(project);
    }

    public void deleteProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ApiException("Project not found", HttpStatus.NOT_FOUND);
        }
        projectRepository.deleteById(projectId);
    }

    public List<AuthDtos.UserProjectStatus> usersWithProjectStatus(Long projectId) {
        Project project = null;
        if (projectId != null) {
            project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ApiException("Project not found", HttpStatus.NOT_FOUND));
        }
        Project finalProject = project;
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.MEMBER)
                .map(user -> {
                    boolean inAnyProject = projectRepository.existsByMembersContaining(user);
                    boolean selected = finalProject != null &&
                            finalProject.getMembers().stream().anyMatch(member -> member.getId().equals(user.getId()));
                    String status = inAnyProject ? "Busy" : "Free";
                    return new AuthDtos.UserProjectStatus(user.getId(), user.getName(), user.getEmail(), status, selected);
                }).toList();
    }
}
