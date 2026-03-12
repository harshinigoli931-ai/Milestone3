package com.petwellness.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {
    private Long id;
    private Long slotId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalTime preferredTime;
    private String consultationType;
    private String vetName;
    private String petName;
    private Long petId;
    private String status;
    private String reason;
    private String notes;
}
