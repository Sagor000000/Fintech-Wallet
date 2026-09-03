package com.fintech.wallet.service;

import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.repository.WalletRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;

    public String depositFunds(Long walletId, BigDecimal amount) {

        
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found!"));

        
        wallet.setCurrentBalance(wallet.getCurrentBalance().add(amount));

        
        walletRepository.save(wallet);

        return "Successfully deposited: " + amount;
    }
}