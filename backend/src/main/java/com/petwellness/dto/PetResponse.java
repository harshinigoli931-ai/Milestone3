package com.petwellness.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetResponse {
    private Long id;
    private String name;
    private String species;
    private String breed;
    private Integer age;
    private LocalDate dateOfBirth;
    private String gender;
    private Double weight;
    private String color;
    private String microchipId;
    private String imageUrl;
    private String notes;
    private Long ownerId;
    private String ownerEmail;
    private List<MedicalHistoryResponse> medicalHistories;
    private List<VaccinationResponse> vaccinations;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MedicalHistoryResponse {
        private Long id;
        private String diagnosis;
        private String treatment;
        private String prescription;
        private String vetName;
        private LocalDate visitDate;
        private String notes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VaccinationResponse {
        private Long id;
        private String vaccineName;
        private LocalDate dateGiven;
        private LocalDate nextDueDate;
        private String batchNumber;
        private String administeredBy;
        private boolean completed;
        private String notes;
    }
}
