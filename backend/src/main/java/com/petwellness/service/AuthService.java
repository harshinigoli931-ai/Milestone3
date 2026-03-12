package com.petwellness.service;

import com.petwellness.dto.*;
import com.petwellness.entity.*;
import com.petwellness.entity.enums.AccountStatus;
import com.petwellness.entity.enums.OtpPurpose;
import com.petwellness.entity.enums.Role;
import com.petwellness.exception.BadRequestException;
import com.petwellness.exception.UnauthorizedException;
import com.petwellness.repository.*;
import com.petwellness.security.JwtTokenProvider;
import com.petwellness.util.ProfileCompletionCalculator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PersonalInformationRepository personalInfoRepo;
    private final AddressRepository addressRepo;
    private final WorkExperienceRepository workExpRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final OtpService otpService;
    private final ProfileCompletionCalculator profileCalculator;

    public AuthService(UserRepository userRepository,
            PersonalInformationRepository personalInfoRepo,
            AddressRepository addressRepo,
            WorkExperienceRepository workExpRepo,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            OtpService otpService,
            ProfileCompletionCalculator profileCalculator) {
        this.userRepository = userRepository;
        this.personalInfoRepo = personalInfoRepo;
        this.addressRepo = addressRepo;
        this.workExpRepo = workExpRepo;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.otpService = otpService;
        this.profileCalculator = profileCalculator;
    }

    /**
     * Step 1: Validate credentials.
     * - ADMIN: skip OTP, return JWT token immediately.
     * - PET_OWNER: send OTP email, return OtpResponse (no token yet).
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            throw new UnauthorizedException("Account is disabled");
        }

        if (user.getAccountStatus() == AccountStatus.PENDING) {
            throw new UnauthorizedException("Account is pending admin approval");
        }

        if (user.getAccountStatus() == AccountStatus.REJECTED) {
            throw new UnauthorizedException("Account registration was rejected");
        }

        // bypassed OTP - issue JWT directly for all users
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        // Update profile completion for PET_OWNER on login if needed, or just return
        // the token
        int completion = profileCalculator.calculate(user);
        if (user.getRole() == Role.PET_OWNER) {
            user.setProfileCompletion(completion);
            userRepository.save(user);
        }

        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .mustChangePassword(user.isMustChangePassword())
                .emailVerified(user.isEmailVerified())
                .profileCompletion(completion)
                .accountStatus(user.getAccountStatus().name())
                .message("Login successful")
                .otpRequired(false)
                .build();
    }

    /**
     * Step 2: Verify OTP and return JWT token
     */
    @Transactional
    public LoginResponse verifyOtpAndLogin(OtpVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        OtpPurpose purpose = OtpPurpose.LOGIN;
        if (request.getPurpose() != null) {
            purpose = OtpPurpose.valueOf(request.getPurpose());
        }

        boolean valid = otpService.verifyOtp(user, request.getOtpCode(), purpose);
        if (!valid) {
            throw new UnauthorizedException("Invalid or expired OTP");
        }

        // For email verification purpose
        if (purpose == OtpPurpose.EMAIL_VERIFICATION) {
            user.setEmailVerified(true);
            userRepository.save(user);
            return LoginResponse.builder()
                    .message("Email verified successfully")
                    .emailVerified(true)
                    .build();
        }

        // Generate JWT for login
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        // Update profile completion
        int completion = profileCalculator.calculate(user);
        user.setProfileCompletion(completion);
        userRepository.save(user);

        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .mustChangePassword(user.isMustChangePassword())
                .emailVerified(user.isEmailVerified())
                .profileCompletion(completion)
                .accountStatus(user.getAccountStatus().name())
                .message("Login successful")
                .otpRequired(false)
                .build();
    }

    /**
     * Owner self-registration
     */
    @Transactional
    public ApiResponse<String> register(RegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.PET_OWNER)
                .accountStatus(AccountStatus.PENDING)
                .emailVerified(false)
                .mustChangePassword(false)
                .profileCompletion(0)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        // Save personal information
        if (request.getFirstName() != null) {
            PersonalInformation info = PersonalInformation.builder()
                    .user(user).firstName(request.getFirstName()).lastName(request.getLastName())
                    .phone(request.getPhone()).dateOfBirth(request.getDateOfBirth())
                    .gender(request.getGender()).build();
            personalInfoRepo.save(info);
        }

        // Save address
        if (request.getCity() != null) {
            Address address = Address.builder()
                    .user(user).street(request.getStreet()).city(request.getCity())
                    .state(request.getState()).zipCode(request.getZipCode())
                    .country(request.getCountry()).build();
            addressRepo.save(address);
        }

        // Save work experience
        if (request.getCompanyName() != null) {
            WorkExperience work = WorkExperience.builder()
                    .user(user).companyName(request.getCompanyName()).designation(request.getDesignation())
                    .industry(request.getIndustry()).yearsOfExperience(request.getYearsOfExperience()).build();
            workExpRepo.save(work);
        }

        // Update profile completion
        int completion = profileCalculator.calculate(user);
        user.setProfileCompletion(completion);
        userRepository.save(user);

        // Send email verification OTP
        otpService.generateAndSendOtp(user, OtpPurpose.EMAIL_VERIFICATION);

        return ApiResponse.success("Registration submitted. Please verify your email and wait for admin approval.");
    }

    /**
     * Change password (forced on first login)
     */
    @Transactional
    public ApiResponse<String> changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        return ApiResponse.success("Password changed successfully");
    }

    /**
     * Request password reset OTP
     */
    @Transactional
    public OtpResponse forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No account found with this email"));

        otpService.generateAndSendOtp(user, OtpPurpose.PASSWORD_RESET);

        return OtpResponse.builder()
                .success(true)
                .message("Password reset OTP sent to your email")
                .email(email)
                .expiryMinutes(5)
                .build();
    }

    /**
     * Reset password using OTP
     */
    @Transactional
    public ApiResponse<String> resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("No account found with this email"));

        boolean valid = otpService.verifyOtp(user, request.getOtpCode(), OtpPurpose.PASSWORD_RESET);
        if (!valid) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        return ApiResponse.success("Password has been reset successfully. You can now login.");
    }
}
