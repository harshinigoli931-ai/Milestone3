package com.petwellness.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "work_experience")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class WorkExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String companyName;
    private String designation;
    private String industry;
    private Integer yearsOfExperience;
}
