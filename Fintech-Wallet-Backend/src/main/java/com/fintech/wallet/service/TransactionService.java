package com.fintech.wallet.service;

import com.fintech.wallet.entity.Transaction;
import com.fintech.wallet.enums.TransactionCategory;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

public interface TransactionService {
    String transferFunds(Long senderWalletId, Long receiverWalletId, BigDecimal amount, TransactionCategory category, String pin);
    String verifyTransferOtp(Long transactionId, String otp);
    Page<Transaction> getTransactionHistory(Long walletId, int page, int size);
}
