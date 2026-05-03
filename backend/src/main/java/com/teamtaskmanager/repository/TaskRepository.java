package com.teamtaskmanager.repository;

import com.teamtaskmanager.entity.Task;
import com.teamtaskmanager.entity.User;
import com.teamtaskmanager.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);
    List<Task> findByAssignedTo(User assignedTo);
    List<Task> findByAssignedToId(Long assignedToId);
    List<Task> findByAssignedToAndProjectId(User assignedTo, Long projectId);
    List<Task> findByAssignedToIdAndProjectId(Long assignedToId, Long projectId);
    List<Task> findByProjectIdIn(List<Long> projectIds);
    List<Task> findByAssignedToAndDueDateBeforeAndStatusNot(User assignedTo, LocalDate date, TaskStatus status);
    long countByAssignedToAndStatus(User assignedTo, TaskStatus status);
    long countByStatus(TaskStatus status);
}
