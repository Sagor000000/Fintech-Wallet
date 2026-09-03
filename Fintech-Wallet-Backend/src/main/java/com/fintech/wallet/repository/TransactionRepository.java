package com.fintech.wallet.repository;

import com.fintech.wallet.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findBySenderWalletIdOrReceiverWalletIdOrderByTimestampDesc(Long senderId, Long receiverId);
    //block double click transaction
    Optional<Transaction> findTopBySenderWalletIdOrderByTimestampDesc(Long senderWalletId);
}