package com.petwellness.controller;

import com.petwellness.dto.AppointmentSlotRequest;
import com.petwellness.entity.AppointmentSlot;
import com.petwellness.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class AppointmentSlotController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public AppointmentSlot createSlot(@RequestBody AppointmentSlotRequest request) {
        return appointmentService.createSlot(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AppointmentSlot updateSlot(@PathVariable Long id, @RequestBody AppointmentSlotRequest request) {
        return appointmentService.updateSlot(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteSlot(@PathVariable Long id) {
        appointmentService.deleteSlot(id);
    }

    @PatchMapping("/{id}/toggle-availability")
    @PreAuthorize("hasRole('ADMIN')")
    public AppointmentSlot toggleAvailability(@PathVariable Long id) {
        return appointmentService.toggleSlotAvailability(id);
    }
}
