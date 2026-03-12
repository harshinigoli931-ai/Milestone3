package com.petwellness.dto;

import lombok.*;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatisticsResponse {
    private long totalPets;
    private long totalUsers;
    private long totalAppointments;
    private Map<String, Long> petsBySpecies;
}
