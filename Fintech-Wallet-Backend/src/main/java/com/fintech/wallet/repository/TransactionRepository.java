package com.fintech.wallet.repository;

import com.fintech.wallet.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    Page<Transaction> findBySenderWalletIdOrReceiverWalletIdOrderByTimestampDesc(Long senderId, Long receiverId, Pageable pageable);

    Optional<Transaction> findTopBySenderWalletIdOrderByTimestampDesc(Long senderWalletId);
}