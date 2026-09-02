package com.fintech.wallet.service;

import com.fintech.wallet.entity.Transaction;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.repository.TransactionRepository;
import com.fintech.wallet.repository.WalletRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class TransactionService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    public TransactionService(WalletRepository walletRepository, TransactionRepository transactionRepository, PasswordEncoder passwordEncoder) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public String transferFunds(Long senderWalletId, Long receiverWalletId, BigDecimal amount, String category, String pin) {

        Wallet sender = walletRepository.findById(senderWalletId)
                .orElseThrow(() -> new RuntimeException("Sender wallet not found!"));

        // Security Check
        String loggedInUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!sender.getUser().getEmail().equalsIgnoreCase(loggedInUserEmail)) {
            throw new RuntimeException("Security Error: You can't send money from someone else's account!");
        }

        // KYC Verification Check
        if (!Boolean.TRUE.equals(sender.getUser().getIsKycVerified())) {
            throw new RuntimeException("Transaction Failed: You are not kyc verified! Please KYC verified before transferring.");
        }

        Wallet receiver = walletRepository.findById(receiverWalletId)
                .orElseThrow(() -> new RuntimeException("Receiver wallet not found!"));

        if (!passwordEncoder.matches(pin, sender.getUser().getTransactionPin())) {
            throw new RuntimeException("Invalid Transaction PIN! Transfer Failed.");
        }

        if (sender.getCurrentBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient Balance!");
        }

        sender.setCurrentBalance(sender.getCurrentBalance().subtract(amount));
        receiver.setCurrentBalance(receiver.getCurrentBalance().add(amount));

        walletRepository.save(sender);
        walletRepository.save(receiver);

        Transaction transaction = new Transaction();
        transaction.setSenderWallet(sender);
        transaction.setReceiverWallet(receiver);
        transaction.setAmount(amount);
        transaction.setStatus("SUCCESS");
        transaction.setCategory(category);
        transaction.setTimestamp(LocalDateTime.now());

        transactionRepository.save(transaction);

        return "Transfer Successful!";
    }

    public java.util.List<com.fintech.wallet.entity.Transaction> getTransactionHistory(Long walletId) {
        return transactionRepository.findBySenderWalletIdOrReceiverWalletIdOrderByTimestampDesc(walletId, walletId);
    }
}