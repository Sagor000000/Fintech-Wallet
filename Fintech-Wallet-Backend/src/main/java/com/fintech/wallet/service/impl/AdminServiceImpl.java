package com.fintech.wallet.service.impl;

import com.fintech.wallet.entity.Transaction;
import com.fintech.wallet.entity.User;
import com.fintech.wallet.repository.TransactionRepository;
import com.fintech.wallet.repository.UserRepository;
import com.fintech.wallet.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public String approveKyc(Long userId) {
        User user = findUser(userId);
        user.setIsKycVerified(true);
        userRepository.save(user);
        return "KYC approved successfully!";
    }

    @Override
    @Transactional
    public String rejectKyc(Long userId) {
        User user = findUser(userId);
        user.setIsKycVerified(false);
        userRepository.save(user);
        return "KYC rejected successfully!";
    }

    @Override
    public Page<Transaction> getAllTransactions(int page, int size) {
        return transactionRepository.findAll(PageRequest.of(page, size));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }
}
