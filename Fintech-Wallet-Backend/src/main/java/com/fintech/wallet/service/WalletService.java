package com.fintech.wallet.service;

import com.fintech.wallet.entity.Wallet;

import java.math.BigDecimal;

public interface WalletService {
    String depositFunds(Long walletId, BigDecimal amount);
    Wallet getCurrentUserWallet();
}
