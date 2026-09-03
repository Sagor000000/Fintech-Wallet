package com.fintech.wallet.controller;

import com.fintech.wallet.dto.KycRequestDto;
import com.fintech.wallet.service.KycService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/kyc")
public class KycController {

    private final KycService kycService;

    @PostMapping("/verify")
    public ResponseEntity<String> verifyKyc(@RequestBody KycRequestDto request, Authentication authentication) {
        String email = authentication.getName();
        String result = kycService.verifyKyc(email, request);

        if (result.contains("Successful")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }
}