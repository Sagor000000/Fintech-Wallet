package com.fintech.wallet.service;

import com.fintech.wallet.dto.KycRequestDto;

public interface KycService {
    String verifyKyc(String email, KycRequestDto request);
}
