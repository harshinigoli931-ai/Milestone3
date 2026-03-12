package com.petwellness.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VaccinationRequest {
    private String vaccineName;
    private LocalDate dateGiven;
    private LocalDate nextDueDate;
    private String batchNumber;
    private String administeredBy;
    private String notes;
}
