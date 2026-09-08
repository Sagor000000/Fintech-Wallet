package com.fintech.wallet.service.impl;

import com.fintech.wallet.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otp, String amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Fintech Wallet - Transaction OTP Verification");
        message.setText("Your OTP for transferring BDT " + amount + " is: " + otp +
                "\nThis OTP is valid for 5 minutes. Do not share it with anyone.");
        mailSender.send(message);
    }
}