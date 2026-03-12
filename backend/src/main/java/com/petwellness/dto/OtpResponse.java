package com.petwellness.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpResponse {
    private boolean success;
    private String message;
    private String email;
    private int expiryMinutes;
}
