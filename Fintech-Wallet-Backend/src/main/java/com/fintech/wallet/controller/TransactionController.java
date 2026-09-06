package com.fintech.wallet.controller;

import com.fintech.wallet.dto.TransferRequestDto;
import com.fintech.wallet.entity.Transaction;
import com.fintech.wallet.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Page<Transaction>> getTransactionHistory(
            @PathVariable Long walletId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<Transaction> history = transactionService.getTransactionHistory(walletId, page, size);
        return ResponseEntity.ok(history);
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestParam Long transactionId, @RequestParam String otp) {
        String response = transactionService.verifyTransferOtp(transactionId, otp);
        return ResponseEntity.ok(response);
    }
}