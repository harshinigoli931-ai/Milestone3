package com.petwellness.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerProfileResponse {
    private Long userId;
    private String email;
    private String accountStatus;
    private boolean emailVerified;
    private int profileCompletion;

    // Personal info
    private String firstName;
    private String lastName;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;

    // Address
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;

    // Work experience
    private String companyName;
    private String designation;
    private String industry;
    private Integer yearsOfExperience;
}
