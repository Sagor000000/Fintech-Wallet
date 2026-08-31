package com.fintech.wallet.service;

import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.repository.WalletRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class WalletService {

    private final WalletRepository walletRepository;

    public WalletService(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    
    public String depositFunds(Long walletId, BigDecimal amount) {

        
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found!"));

        
        wallet.setCurrentBalance(wallet.getCurrentBalance().add(amount));

        
        walletRepository.save(wallet);

        return "Successfully deposited: " + amount;
    }
}