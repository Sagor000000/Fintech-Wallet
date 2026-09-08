package com.fintech.wallet.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otp, String amount);
}
