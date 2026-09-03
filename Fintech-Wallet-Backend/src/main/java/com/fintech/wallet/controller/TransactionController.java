package com.fintech.wallet.controller;

import com.fintech.wallet.dto.TransferRequestDto;
import com.fintech.wallet.entity.Transaction;
import com.fintech.wallet.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    public ResponseEntity<String> transferFunds(@RequestBody TransferRequestDto request) {

        String response = transactionService.transferFunds(
                request.getSenderWalletId(),
                request.getReceiverWalletId(),
                request.getAmount(),
                request.getCategory(),
                request.getPin()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{walletId}")
    public ResponseEntity<List<Transaction>> getTransactionHistory(@PathVariable Long walletId) {
        List<Transaction> history = transactionService.getTransactionHistory(walletId);
        return ResponseEntity.ok(history);
    }
}