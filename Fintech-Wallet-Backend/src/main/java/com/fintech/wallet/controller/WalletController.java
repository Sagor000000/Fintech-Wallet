package com.fintech.wallet.controller;

import com.fintech.wallet.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @PostMapping("/{walletId}/deposit")
    public ResponseEntity<String> depositFunds(
            @PathVariable Long walletId,
            @RequestParam BigDecimal amount) {

        String response = walletService.depositFunds(walletId, amount);
        return ResponseEntity.ok(response);
    }
}