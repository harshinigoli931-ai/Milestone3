package com.petwellness.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PetRequest {
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
}
