package com.petwellness.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentSlotRequest {
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String consultationType; // ONLINE, CLINIC
    private Long vetId;
    private String vetName;
    private Integer maxBookings;
}
