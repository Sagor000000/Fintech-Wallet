package com.fintech.wallet.service;

import com.fintech.wallet.entity.User;

public interface UserService {
    User registerUser(User user);
    String deactivateUser(Long userId);
    String activateUser(Long userId);
    String loginUser(String email, String password);
    User getCurrentUser();
}
