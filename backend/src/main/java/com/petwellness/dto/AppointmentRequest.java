package com.petwellness.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequest {
    private Long slotId;
    private Long petId;
    private String reason;
    private String notes;
    private String consultationType;
    private String preferredTime;
}
