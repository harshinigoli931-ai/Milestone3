package com.petwellness.controller;

import com.petwellness.dto.*;
import com.petwellness.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Auth with OTP verification")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Login - Standard authentication returning token")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP and get JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        LoginResponse response = authService.verifyOtpAndLogin(request);
        return ResponseEntity.ok(ApiResponse.success("Verified", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register as pet owner (requires admin approval)")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegistrationRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset OTP")
    public ResponseEntity<ApiResponse<OtpResponse>> forgotPassword(@RequestParam("email") String email) {
        OtpResponse response = authService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success("OTP sent", response));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Verify OTP and reset password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
}
