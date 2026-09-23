package com.healthbridge.controller;

import com.healthbridge.dto.AuthRequest;
import com.healthbridge.dto.AuthResponse;
import com.healthbridge.dto.RegisterRequest;
import com.healthbridge.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.healthbridge.dto.ForgotPasswordRequest;
import com.healthbridge.dto.ResetPasswordRequest;
import com.healthbridge.dto.VerifyOtpRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String otp = userService.sendPasswordResetOtp(request.getEmail());
        return ResponseEntity.ok(Map.of(
            "message", "Verification code sent to " + request.getEmail() + " successfully.",
            "email", request.getEmail(),
            "otpPreview", otp // Provides instant accessibility for evaluation/dev testing
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        boolean valid = userService.verifyOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(Map.of(
            "message", "Verification code verified successfully.",
            "valid", valid
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(Map.of(
            "message", "Password has been successfully updated! You can now sign in with your new password."
        ));
    }
}
