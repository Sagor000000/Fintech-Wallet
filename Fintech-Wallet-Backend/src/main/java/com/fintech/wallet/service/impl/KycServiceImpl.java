package com.fintech.wallet.service.impl;

import com.fintech.wallet.dto.KycRequestDto;
import com.fintech.wallet.entity.User;
import com.fintech.wallet.repository.UserRepository;
import com.fintech.wallet.service.KycService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KycServiceImpl implements KycService {

    private final UserRepository userRepository;

    @Override
    public String verifyKyc(String email, KycRequestDto request) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return "User not found!";
        }

        User user = userOptional.get();
        if (Boolean.TRUE.equals(user.getIsKycVerified())) {
            return "Your KYC is already verified!";
        }

        if (userRepository.existsByNid(request.getNid())) {
            return "KYC Failed: This NID is already in use!";
        }

        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                new ClassPathResource("dummy_kyc.csv").getInputStream()))) {
            String line;
            boolean isFirstLine = true;

            while ((line = br.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }
                String[] data = line.split(",");
                if (data.length >= 5) {
                    String csvNid = data[0].trim();
                    String csvName = data[1].trim();
                    String csvFatherName = data[2].trim();
                    String csvMotherName = data[3].trim();
                    String csvDob = data[4].trim();

                    if (csvNid.equals(request.getNid().trim())) {

                        if (user.getName() == null || !user.getName().equalsIgnoreCase(csvName)) {
                            return "KYC Failed: Your account's name does not match with the NID name!";
                        }

                        if (csvFatherName.equalsIgnoreCase(request.getFatherName().trim()) &&
                                csvMotherName.equalsIgnoreCase(request.getMotherName().trim()) &&
                                csvDob.equals(request.getDob().trim())) {

                            user.setIsKycVerified(true);
                            user.setNid(request.getNid());
                            userRepository.save(user);
                            return "KYC Verification Successful!";
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Server Error: Something went wrong! ";
        }

        return "KYC Verification Failed! Your given information does not match with the NID!";
    }
}