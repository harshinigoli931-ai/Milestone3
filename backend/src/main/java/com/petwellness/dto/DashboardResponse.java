package com.petwellness.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private int totalPets;
    private int upcomingAppointments;
    private int pendingVaccinations;
    private int totalOrders;
    private int profileCompletion;
    private List<PetResponse> pets;
    private List<AppointmentResponse> recentAppointments;
    private List<ReminderResponse> pendingReminders;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReminderResponse {
        private Long id;
        private String type;
        private String message;
        private String petName;
    }
}
