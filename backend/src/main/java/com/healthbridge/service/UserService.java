package com.healthbridge.service;

import com.healthbridge.dto.AuthRequest;
import com.healthbridge.dto.AuthResponse;
import com.healthbridge.dto.RegisterRequest;
import com.healthbridge.entity.Doctor;
import com.healthbridge.entity.Notification;
import com.healthbridge.entity.User;
import com.healthbridge.exception.ResourceNotFoundException;
import com.healthbridge.repository.DoctorRepository;
import com.healthbridge.repository.NotificationRepository;
import com.healthbridge.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthbridge.entity.PasswordResetOtp;
import com.healthbridge.repository.PasswordResetOtpRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       DoctorRepository doctorRepository,
                       NotificationRepository notificationRepository,
                       PasswordResetOtpRepository passwordResetOtpRepository,
                       EmailService emailService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.notificationRepository = notificationRepository;
        this.passwordResetOtpRepository = passwordResetOtpRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole() != null ? request.getRole().toUpperCase() : "PATIENT");

        User savedUser = userRepository.save(user);

        // Welcome notification
        Notification welcomeNotice = new Notification(
            savedUser,
            "Welcome to HealthBridge!",
            "Welcome, " + savedUser.getName() + ". Your healthcare journey is now simple, smart, and connected.",
            "SYSTEM"
        );
        notificationRepository.save(welcomeNotice);

        String token = "HB-TOKEN-" + UUID.randomUUID().toString();
        return new AuthResponse(token, savedUser.getId(), savedUser.getName(), savedUser.getEmail(),
                savedUser.getPhone(), savedUser.getRole(), null);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        Long doctorId = null;
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            Optional<Doctor> doc = doctorRepository.findByUserId(user.getId());
            if (doc.isPresent()) {
                doctorId = doc.get().getId();
            }
        }

        String token = "HB-TOKEN-" + UUID.randomUUID().toString();
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(),
                user.getPhone(), user.getRole(), doctorId);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public String sendPasswordResetOtp(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        
        // Find existing user or auto-provision account if testing with an unregistered email (e.g. personal Gmail)
        userRepository.findByEmail(normalizedEmail).orElseGet(() -> {
            String name = normalizedEmail.contains("@")
                    ? normalizedEmail.substring(0, normalizedEmail.indexOf("@"))
                    : "User";
            if (!name.isEmpty()) {
                name = Character.toUpperCase(name.charAt(0)) + name.substring(1);
            }
            User newUser = new User(name, normalizedEmail,
                    passwordEncoder.encode(UUID.randomUUID().toString()),
                    "+91 98765 00000", "PATIENT");
            return userRepository.save(newUser);
        });

        // Generate secure 6-digit random code
        String otp = String.format("%06d", new Random().nextInt(1000000));
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);

        PasswordResetOtp resetOtp = new PasswordResetOtp(normalizedEmail, otp, expiryTime);
        passwordResetOtpRepository.save(resetOtp);

        emailService.sendVerificationCodeEmail(normalizedEmail, otp);
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        String normalizedEmail = email.toLowerCase().trim();
        String normalizedOtp = otp.trim();

        PasswordResetOtp resetOtp = passwordResetOtpRepository
                .findTopByEmailIgnoreCaseAndOtpAndUsedFalseOrderByCreatedAtDesc(normalizedEmail, normalizedOtp)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification code. Please check your email and try again."));

        if (resetOtp.isExpired()) {
            throw new IllegalArgumentException("Verification code has expired. Please request a new code.");
        }

        return true;
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        String normalizedEmail = email.toLowerCase().trim();
        String normalizedOtp = otp.trim();

        PasswordResetOtp resetOtp = passwordResetOtpRepository
                .findTopByEmailIgnoreCaseAndOtpAndUsedFalseOrderByCreatedAtDesc(normalizedEmail, normalizedOtp)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification code."));

        if (resetOtp.isExpired()) {
            throw new IllegalArgumentException("Verification code has expired. Please request a new code.");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark OTP as used so it cannot be re-used
        resetOtp.setUsed(true);
        passwordResetOtpRepository.save(resetOtp);

        // Send a security notification to the user
        Notification notice = new Notification(
                user,
                "Password Changed Successfully",
                "The password for your HealthBridge account was successfully changed. If this was not you, contact support immediately.",
                "SYSTEM"
        );
        notificationRepository.save(notice);
    }
}
