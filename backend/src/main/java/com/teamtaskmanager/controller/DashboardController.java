package com.teamtaskmanager.controller;

import com.teamtaskmanager.dto.AuthDtos;
import com.teamtaskmanager.entity.User;
import com.teamtaskmanager.service.DashboardService;
import com.teamtaskmanager.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    private final UserService userService;

    public DashboardController(DashboardService dashboardService, UserService userService) {
        this.dashboardService = dashboardService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<AuthDtos.DashboardResponse> dashboard(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(dashboardService.getDashboard(currentUser));
    }
}
