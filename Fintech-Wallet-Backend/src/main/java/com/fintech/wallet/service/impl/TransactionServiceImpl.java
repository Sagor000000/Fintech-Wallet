package com.fintech.wallet.service.impl;

import com.fintech.wallet.entity.Transaction;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.enums.TransactionCategory;
import com.fintech.wallet.enums.TransactionStatus;
import com.fintech.wallet.repository.TransactionRepository;
import com.fintech.wallet.repository.WalletRepository;
import com.fintech.wallet.service.EmailService;
import com.fintech.wallet.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    @Override
    public String transferFunds(Long senderWalletId, Long receiverWalletId, BigDecimal amount, TransactionCategory category, String pin) {

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Transfer amount must be greater than zero!");
        }

        if (senderWalletId.equals(receiverWalletId)) {
            throw new RuntimeException("You cannot transfer money to your own wallet!");
        }

        // Concurrency Lock
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


        Transaction transaction = new Transaction();
        transaction.setSenderWallet(sender);
        transaction.setReceiverWallet(receiver);
        transaction.setAmount(amount);
        transaction.setCategory(category);
        transaction.setTimestamp(LocalDateTime.now());

        BigDecimal limit = new BigDecimal("10000");

        if (amount.compareTo(limit) > 0) {

            String otp = String.format("%06d", new Random().nextInt(1000000));
            transaction.setStatus(TransactionStatus.PENDING);
            transaction.setOtp(otp);
            transaction.setOtpExpiry(LocalDateTime.now().plusMinutes(5)); // ৫ মিনিট মেয়াদ

            transactionRepository.save(transaction);

            emailService.sendOtpEmail(sender.getUser().getEmail(), otp, amount.toString());

            return "Transaction requires OTP. Check your email. Transaction ID: " + transaction.getId();
        } else {

            sender.setCurrentBalance(sender.getCurrentBalance().subtract(amount));
            receiver.setCurrentBalance(receiver.getCurrentBalance().add(amount));

            walletRepository.save(sender);
            walletRepository.save(receiver);

            transaction.setStatus(TransactionStatus.SUCCESS);
            transactionRepository.save(transaction);

            messagingTemplate.convertAndSend("/topic/notifications/" + receiverWalletId,
                    "You have received BDT " + amount + " from Wallet ID: " + senderWalletId);

            return "Transfer Successful!";
        }
    }

    @Transactional
    @Override
    public String verifyTransferOtp(Long transactionId, String otp) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found!"));

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new RuntimeException("Transaction is not in PENDING state!");
        }

        if (transaction.getOtpExpiry().isBefore(LocalDateTime.now())) {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new RuntimeException("OTP has expired!");
        }

        if (!transaction.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP!");
        }

        Wallet sender = transaction.getSenderWallet();
        Wallet receiver = transaction.getReceiverWallet();


        if (sender.getCurrentBalance().compareTo(transaction.getAmount()) < 0) {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new RuntimeException("Insufficient Balance!");
        }

        sender.setCurrentBalance(sender.getCurrentBalance().subtract(transaction.getAmount()));
        receiver.setCurrentBalance(receiver.getCurrentBalance().add(transaction.getAmount()));

        walletRepository.save(sender);
        walletRepository.save(receiver);

        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setOtp(null);
        transaction.setOtpExpiry(null);
        transactionRepository.save(transaction);

        messagingTemplate.convertAndSend("/topic/notifications/" + receiver.getId(),
                "You have received BDT " + transaction.getAmount() + " from Wallet ID: " + sender.getId());

        return "OTP Verified! Transfer Successful!";
    }

    @Override
    public Page<Transaction> getTransactionHistory(Long walletId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return transactionRepository.findBySenderWalletIdOrReceiverWalletIdOrderByTimestampDesc(walletId, walletId, pageable);
    }
}