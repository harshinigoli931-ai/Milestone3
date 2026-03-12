package com.petwellness.service;

import com.petwellness.entity.OtpVerification;
import com.petwellness.entity.User;
import com.petwellness.entity.enums.OtpPurpose;
import com.petwellness.repository.OtpVerificationRepository;
import com.petwellness.util.PasswordGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;

    @Value("${app.otp.expiry-minutes:5}")
    private int otpExpiryMinutes;

    @Value("${app.otp.length:6}")
    private int otpLength;

    public OtpService(OtpVerificationRepository otpRepository, EmailService emailService) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void generateAndSendOtp(User user, OtpPurpose purpose) {
        String otpCode = PasswordGenerator.generateOtp(otpLength);

        OtpVerification otp = OtpVerification.builder()
                .user(user)
                .otpCode(otpCode)
                .purpose(purpose)
                .expiryTime(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .used(false)
                .build();
        otpRepository.save(otp);

        // Send OTP via email
        String subject = getSubjectForPurpose(purpose);
        String body = String.format(
                "Your OTP code is: %s\n\nThis code will expire in %d minutes.\n\nIf you did not request this, please ignore this email.",
                otpCode, otpExpiryMinutes);
        emailService.sendEmail(user.getEmail(), subject, body);

        log.info("OTP generated for user {} with purpose {}: {}", user.getEmail(), purpose, otpCode);
    }

    @Transactional
    public boolean verifyOtp(User user, String otpCode, OtpPurpose purpose) {
        Optional<OtpVerification> otpOpt = otpRepository
                .findTopByUserIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(user.getId(), purpose);

        if (otpOpt.isEmpty()) {
            return false;
        }

        OtpVerification otp = otpOpt.get();

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            return false; // OTP expired
        }

        if (!otp.getOtpCode().equals(otpCode)) {
            return false; // Wrong code
        }

        otp.setUsed(true);
        otpRepository.save(otp);
        return true;
    }

    @Transactional
    public void cleanupExpiredOtps() {
        otpRepository.deleteByExpiryTimeBefore(LocalDateTime.now());
    }

    private String getSubjectForPurpose(OtpPurpose purpose) {
        return switch (purpose) {
            case LOGIN -> "Pet Wellness - Login OTP";
            case EMAIL_VERIFICATION -> "Pet Wellness - Email Verification OTP";
            case PASSWORD_RESET -> "Pet Wellness - Password Reset OTP";
        };
    }
}
