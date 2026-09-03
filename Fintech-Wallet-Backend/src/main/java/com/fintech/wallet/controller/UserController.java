package com.fintech.wallet.controller;

import com.fintech.wallet.entity.User;
import com.fintech.wallet.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        User createdUser = userService.registerUser(user);
        return ResponseEntity.ok(createdUser);
    }

    
    @PutMapping("/{userId}/deactivate")
    public ResponseEntity<String> deactivateUser(@PathVariable Long userId) {
        String response = userService.deactivateUser(userId);
        return ResponseEntity.ok(response);
    }

    
    @PutMapping("/{userId}/activate")
    public ResponseEntity<String> activateUser(@PathVariable Long userId) {
        String response = userService.activateUser(userId);
        return ResponseEntity.ok(response);
    }

    
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody com.fintech.wallet.dto.LoginRequest loginRequest) {
        String token = userService.loginUser(loginRequest.email(), loginRequest.password());
        return ResponseEntity.ok(token);
    }
}