package com.fintech.wallet.service;

import com.fintech.wallet.entity.Transaction;
import com.fintech.wallet.entity.User;
import org.springframework.data.domain.Page;

import java.util.List;

public interface AdminService {
    List<User> getAllUsers();

    String approveKyc(Long userId);

    String rejectKyc(Long userId);

    Page<Transaction> getAllTransactions(int page, int size);
}
