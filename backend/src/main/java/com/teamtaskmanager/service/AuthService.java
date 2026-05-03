package com.teamtaskmanager.service;

import com.teamtaskmanager.dto.AuthDtos;
import com.teamtaskmanager.entity.User;
import com.teamtaskmanager.enums.Role;
import com.teamtaskmanager.exception.ApiException;
import com.teamtaskmanager.repository.UserRepository;
import com.teamtaskmanager.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthDtos.AuthResponse signup(AuthDtos.SignupRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(u -> {
            throw new ApiException("Email already exists", HttpStatus.CONFLICT);
        });

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() == null ? Role.MEMBER : request.getRole());
        userRepository.save(user);
        return buildResponse(user);
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Account not found. Please sign up first!", HttpStatus.UNAUTHORIZED));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("Incorrect password. Please try again.", HttpStatus.UNAUTHORIZED);
        }
        return buildResponse(user);
    }

    private AuthDtos.AuthResponse buildResponse(User user) {
        AuthDtos.AuthResponse response = new AuthDtos.AuthResponse();
        response.setToken(jwtUtil.generateToken(user.getEmail()));
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        return response;
    }
}
