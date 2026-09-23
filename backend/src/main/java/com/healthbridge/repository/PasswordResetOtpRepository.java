package com.healthbridge.repository;

import com.healthbridge.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {
    Optional<PasswordResetOtp> findTopByEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(String email);
    Optional<PasswordResetOtp> findTopByEmailIgnoreCaseAndOtpAndUsedFalseOrderByCreatedAtDesc(String email, String otp);
}
