package com.petwellness.controller;

import com.petwellness.dto.*;
import com.petwellness.entity.AppointmentSlot;
import com.petwellness.entity.User;
import com.petwellness.repository.UserRepository;
import com.petwellness.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@PreAuthorize("hasRole('PET_OWNER')")
@Tag(name = "Appointments", description = "Appointment booking and management")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;

    public AppointmentController(AppointmentService appointmentService, UserRepository userRepository) {
        this.appointmentService = appointmentService;
        this.userRepository = userRepository;
    }

    @GetMapping("/slots")
    @Operation(summary = "Get available appointment slots")
    public ResponseEntity<ApiResponse<List<AppointmentSlot>>> getAvailableSlots() {
        return ResponseEntity.ok(ApiResponse.success("Available slots", appointmentService.getAvailableSlots()));
    }

    @PostMapping("/book")
    @Operation(summary = "Book an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(@RequestBody AppointmentRequest request,
            Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(ApiResponse.success("Appointment booked",
                appointmentService.bookAppointment(user.getId(), request)));
    }

    @PostMapping("/{appointmentId}/cancel")
    @Operation(summary = "Cancel an appointment")
    public ResponseEntity<ApiResponse<Void>> cancelAppointment(@PathVariable("appointmentId") Long appointmentId,
            Authentication authentication) {
        User user = getUser(authentication);
        appointmentService.cancelAppointment(user.getId(), appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled"));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointments(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(ApiResponse.success("Your appointments",
                appointmentService.getOwnerAppointments(user.getId())));
    }

    @GetMapping("/slots/{slotId}/booked-times")
    @Operation(summary = "Get already booked preferred times for a slot")
    public ResponseEntity<ApiResponse<List<String>>> getBookedTimes(@PathVariable("slotId") Long slotId) {
        return ResponseEntity.ok(ApiResponse.success("Booked times",
                appointmentService.getBookedTimesForSlot(slotId)));
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
