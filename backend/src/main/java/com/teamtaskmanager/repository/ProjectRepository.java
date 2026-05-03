package com.teamtaskmanager.repository;

import com.teamtaskmanager.entity.Project;
import com.teamtaskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByMembersContainingOrCreatedBy(User member, User creator);
    List<Project> findByMembersContaining(User member);
    boolean existsByMembersContaining(User user);
}
