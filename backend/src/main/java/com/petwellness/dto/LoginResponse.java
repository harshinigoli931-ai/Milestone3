package com.petwellness.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String email;
    private String role;
    private boolean mustChangePassword;
    private boolean emailVerified;
    private int profileCompletion;
    private String accountStatus;
    private String message;
    private boolean otpRequired;
}
