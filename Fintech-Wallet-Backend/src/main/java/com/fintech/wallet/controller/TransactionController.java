package com.fintech.wallet.controller;

import com.fintech.wallet.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    
    @PostMapping("/transfer")
    public ResponseEntity<String> transferFunds(
            @RequestParam Long senderWalletId,
            @RequestParam Long receiverWalletId,
            @RequestParam BigDecimal amount,
            @RequestParam String category,
            @RequestParam String pin){

        String response = transactionService.transferFunds(senderWalletId, receiverWalletId, amount, category, pin);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/history/{walletId}")
    public ResponseEntity<java.util.List<com.fintech.wallet.entity.Transaction>> getTransactionHistory(@PathVariable Long walletId) {
        java.util.List<com.fintech.wallet.entity.Transaction> history = transactionService.getTransactionHistory(walletId);
        return ResponseEntity.ok(history);
    }
}