package com.petwellness.controller;

import com.petwellness.dto.*;
import com.petwellness.entity.User;
import com.petwellness.repository.UserRepository;
import com.petwellness.service.AuthService;
import com.petwellness.service.OwnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner")
@PreAuthorize("hasRole('PET_OWNER')")
@Tag(name = "Pet Owner", description = "Pet owner profile management")
public class OwnerController {

    private final OwnerService ownerService;
    private final AuthService authService;
    private final UserRepository userRepository;

    public OwnerController(OwnerService ownerService, AuthService authService, UserRepository userRepository) {
        this.ownerService = ownerService;
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get owner profile")
    public ResponseEntity<ApiResponse<OwnerProfileResponse>> getProfile(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", ownerService.getProfile(user.getId())));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update owner profile")
    public ResponseEntity<ApiResponse<OwnerProfileResponse>> updateProfile(@RequestBody RegistrationRequest request,
            Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity
                .ok(ApiResponse.success("Profile updated", ownerService.updateProfile(user.getId(), request)));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse<String>> changePassword(@Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(authService.changePassword(user.getId(), request));
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
