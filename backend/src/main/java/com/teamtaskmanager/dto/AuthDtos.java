package com.teamtaskmanager.dto;

import com.teamtaskmanager.enums.Priority;
import com.teamtaskmanager.enums.Role;
import com.teamtaskmanager.enums.TaskStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class AuthDtos {
    public static class SignupRequest {
        @NotBlank
        private String name;
        @Email
        @NotBlank
        private String email;
        @NotBlank
        @Size(min = 6)
        private String password;
        @NotNull
        private Role role;

        public SignupRequest() {
        }

        public SignupRequest(String name, String email, String password, Role role) {
            this.name = name;
            this.email = email;
            this.password = password;
            this.role = role;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }
    }

    public static class LoginRequest {
        @Email
        @NotBlank
        private String email;
        @NotBlank
        private String password;

        public LoginRequest() {
        }

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class AuthResponse {
        private String token;
        private Long userId;
        private String name;
        private String email;
        private Role role;

        public AuthResponse() {
        }

        public AuthResponse(String token, Long userId, String name, String email, Role role) {
            this.token = token;
            this.userId = userId;
            this.name = name;
            this.email = email;
            this.role = role;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }
    }

    public static class ProjectRequest {
        @NotBlank
        private String name;
        @NotBlank
        private String description;
        private List<Long> memberIds;

        public ProjectRequest() {
        }

        public ProjectRequest(String name, String description, List<Long> memberIds) {
            this.name = name;
            this.description = description;
            this.memberIds = memberIds;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public List<Long> getMemberIds() {
            return memberIds;
        }

        public void setMemberIds(List<Long> memberIds) {
            this.memberIds = memberIds;
        }
    }

    public static class AddMemberRequest {
        @NotNull
        private Long userId;

        public AddMemberRequest() {
        }

        public AddMemberRequest(Long userId) {
            this.userId = userId;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }
    }

    public static class TaskRequest {
        @NotBlank
        private String title;
        @NotBlank
        private String description;
        @NotNull
        private TaskStatus status;
        @NotNull
        private Priority priority;
        @NotNull
        private LocalDate dueDate;
        private Long assignedToId;
        @NotNull
        private Long projectId;

        public TaskRequest() {
        }

        public TaskRequest(String title, String description, TaskStatus status, Priority priority, LocalDate dueDate,
                           Long assignedToId, Long projectId) {
            this.title = title;
            this.description = description;
            this.status = status;
            this.priority = priority;
            this.dueDate = dueDate;
            this.assignedToId = assignedToId;
            this.projectId = projectId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public TaskStatus getStatus() {
            return status;
        }

        public void setStatus(TaskStatus status) {
            this.status = status;
        }

        public Priority getPriority() {
            return priority;
        }

        public void setPriority(Priority priority) {
            this.priority = priority;
        }

        public LocalDate getDueDate() {
            return dueDate;
        }

        public void setDueDate(LocalDate dueDate) {
            this.dueDate = dueDate;
        }

        public Long getAssignedToId() {
            return assignedToId;
        }

        public void setAssignedToId(Long assignedToId) {
            this.assignedToId = assignedToId;
        }

        public Long getProjectId() {
            return projectId;
        }

        public void setProjectId(Long projectId) {
            this.projectId = projectId;
        }
    }

    public static class DashboardResponse {
        private long totalTasks;
        private Map<String, Long> tasksByStatus;
        private long overdueTasksCount;
        private List<TaskSummary> myAssignedTasks;
        private long projectCount;

        public DashboardResponse() {
        }

        public DashboardResponse(long totalTasks, Map<String, Long> tasksByStatus, long overdueTasksCount,
                                 List<TaskSummary> myAssignedTasks, long projectCount) {
            this.totalTasks = totalTasks;
            this.tasksByStatus = tasksByStatus;
            this.overdueTasksCount = overdueTasksCount;
            this.myAssignedTasks = myAssignedTasks;
            this.projectCount = projectCount;
        }

        public long getTotalTasks() {
            return totalTasks;
        }

        public void setTotalTasks(long totalTasks) {
            this.totalTasks = totalTasks;
        }

        public Map<String, Long> getTasksByStatus() {
            return tasksByStatus;
        }

        public void setTasksByStatus(Map<String, Long> tasksByStatus) {
            this.tasksByStatus = tasksByStatus;
        }

        public long getOverdueTasksCount() {
            return overdueTasksCount;
        }

        public void setOverdueTasksCount(long overdueTasksCount) {
            this.overdueTasksCount = overdueTasksCount;
        }

        public List<TaskSummary> getMyAssignedTasks() {
            return myAssignedTasks;
        }

        public void setMyAssignedTasks(List<TaskSummary> myAssignedTasks) {
            this.myAssignedTasks = myAssignedTasks;
        }

        public long getProjectCount() {
            return projectCount;
        }

        public void setProjectCount(long projectCount) {
            this.projectCount = projectCount;
        }
    }

    public static class TaskSummary {
        private Long id;
        private String title;
        private TaskStatus status;
        private Priority priority;
        private LocalDate dueDate;
        private Long projectId;
        private String projectName;
        private Long assignedToId;
        private String assignedToName;

        public TaskSummary() {
        }

        public TaskSummary(Long id, String title, TaskStatus status, Priority priority, LocalDate dueDate, Long projectId,
                           String projectName, Long assignedToId, String assignedToName) {
            this.id = id;
            this.title = title;
            this.status = status;
            this.priority = priority;
            this.dueDate = dueDate;
            this.projectId = projectId;
            this.projectName = projectName;
            this.assignedToId = assignedToId;
            this.assignedToName = assignedToName;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public TaskStatus getStatus() {
            return status;
        }

        public void setStatus(TaskStatus status) {
            this.status = status;
        }

        public Priority getPriority() {
            return priority;
        }

        public void setPriority(Priority priority) {
            this.priority = priority;
        }

        public LocalDate getDueDate() {
            return dueDate;
        }

        public void setDueDate(LocalDate dueDate) {
            this.dueDate = dueDate;
        }

        public Long getProjectId() {
            return projectId;
        }

        public void setProjectId(Long projectId) {
            this.projectId = projectId;
        }

        public String getProjectName() {
            return projectName;
        }

        public void setProjectName(String projectName) {
            this.projectName = projectName;
        }

        public Long getAssignedToId() {
            return assignedToId;
        }

        public void setAssignedToId(Long assignedToId) {
            this.assignedToId = assignedToId;
        }

        public String getAssignedToName() {
            return assignedToName;
        }

        public void setAssignedToName(String assignedToName) {
            this.assignedToName = assignedToName;
        }
    }

    public static class UserProjectStatus {
        private Long id;
        private String name;
        private String email;
        private String status;
        private boolean selected;

        public UserProjectStatus() {
        }

        public UserProjectStatus(Long id, String name, String email, String status, boolean selected) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.status = status;
            this.selected = selected;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public boolean isSelected() {
            return selected;
        }

        public void setSelected(boolean selected) {
            this.selected = selected;
        }
    }
}
