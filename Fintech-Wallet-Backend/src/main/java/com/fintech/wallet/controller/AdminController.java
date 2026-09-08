package com.fintech.wallet.controller;

import com.fintech.wallet.entity.Transaction;
import com.fintech.wallet.entity.User;
import com.fintech.wallet.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/kyc/{userId}/approve")
    public ResponseEntity<String> approveKyc(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.approveKyc(userId));
    }

    @PutMapping("/kyc/{userId}/reject")
    public ResponseEntity<String> rejectKyc(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.rejectKyc(userId));
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<Transaction>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getAllTransactions(page, size));
    }
}
