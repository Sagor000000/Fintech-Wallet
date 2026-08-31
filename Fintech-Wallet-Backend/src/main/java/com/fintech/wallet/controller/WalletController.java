package com.fintech.wallet.controller;

import com.fintech.wallet.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    
    @PostMapping("/{walletId}/deposit")
    public ResponseEntity<String> depositFunds(
            @PathVariable Long walletId,
            @RequestParam BigDecimal amount) {

        String response = walletService.depositFunds(walletId, amount);
        return ResponseEntity.ok(response);
    }
}