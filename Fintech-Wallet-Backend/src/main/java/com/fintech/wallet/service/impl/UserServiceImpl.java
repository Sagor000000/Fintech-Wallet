package com.fintech.wallet.service.impl;

import com.fintech.wallet.entity.User;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.enums.UserRole;
import com.fintech.wallet.repository.UserRepository;
import com.fintech.wallet.repository.WalletRepository;
import com.fintech.wallet.service.UserService;
import com.fintech.wallet.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User registerUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("This email is already registered! Please use a different email.");
        }

        user.setIsActive(true);
        user.setIsKycVerified(false);
        user.setRole(UserRole.USER);

        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        if (user.getTransactionPin() != null) {
            user.setTransactionPin(passwordEncoder.encode(user.getTransactionPin()));
        }

        User savedUser = userRepository.save(user);

        Wallet newWallet = new Wallet();
        newWallet.setUser(savedUser);
        newWallet.setCurrentBalance(new java.math.BigDecimal("1000.00"));
        walletRepository.save(newWallet);

        return savedUser;
    }

    @Override
    public String deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            return "User is already deactivated!";
        }

        user.setIsActive(false);
        userRepository.save(user);

        return "User account deactivated successfully!";
    }

    @Override
    public String activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (Boolean.TRUE.equals(user.getIsActive())) {
            return "User account is already active!";
        }

        user.setIsActive(true);
        userRepository.save(user);

        return "User account activated successfully!";
    }

    @Override
    public String loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email!"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("Your account is deactivated. Please contact support.");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid Password!");
        }

        return jwtUtil.generateToken(email);
    }

    @Override
    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }
}