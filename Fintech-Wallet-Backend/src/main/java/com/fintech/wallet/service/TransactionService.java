package com.fintech.wallet.service;

import com.fintech.wallet.entity.Transaction;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.repository.TransactionRepository;
import com.fintech.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public String transferFunds(Long senderWalletId, Long receiverWalletId, BigDecimal amount, String category, String pin) {

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Transfer amount must be greater than zero!");
        }

        if (senderWalletId.equals(receiverWalletId)) {
            throw new RuntimeException("You cannot transfer money to your own wallet!");
        }

        // Concurrency Lock: findWalletForUpdateById ব্যবহার করা হলো
        Wallet sender = walletRepository.findWalletForUpdateById(senderWalletId)
                .orElseThrow(() -> new RuntimeException("Sender wallet not found!"));

        transactionRepository.findTopBySenderWalletIdOrderByTimestampDesc(senderWalletId)
                .ifPresent(lastTx -> {
                    long secondsSinceLastTx = Duration.between(lastTx.getTimestamp(), LocalDateTime.now()).getSeconds();

                    if (secondsSinceLastTx < 30
                            && lastTx.getReceiverWallet().getId().equals(receiverWalletId)
                            && lastTx.getAmount().compareTo(amount) == 0) {
                        throw new RuntimeException("Duplicate Transaction! Please wait 30 seconds before sending again.");
                    }
                });

        String loggedInUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!sender.getUser().getEmail().equalsIgnoreCase(loggedInUserEmail)) {
            throw new RuntimeException("Security Error: You can't send money from someone else's account!");
        }

        if (!Boolean.TRUE.equals(sender.getUser().getIsKycVerified())) {
            throw new RuntimeException("Transaction Failed: You are not kyc verified! Please KYC verified before transferring.");
        }

        Wallet receiver = walletRepository.findWalletForUpdateById(receiverWalletId)
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

    public Page<Transaction> getTransactionHistory(Long walletId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return transactionRepository.findBySenderWalletIdOrReceiverWalletIdOrderByTimestampDesc(walletId, walletId, pageable);
    }
}