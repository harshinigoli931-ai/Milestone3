package com.petwellness.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalHistoryRequest {
    private String diagnosis;
    private String treatment;
    private String prescription;
    private String vetName;
    private LocalDate visitDate;
    private String notes;
}
