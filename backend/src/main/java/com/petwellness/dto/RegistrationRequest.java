package com.petwellness.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationRequest {
    // User credentials
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    // Personal information
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

    // Pet and Education
    private Integer numberOfPets;
    private String petTypes;
    private String education;
}
