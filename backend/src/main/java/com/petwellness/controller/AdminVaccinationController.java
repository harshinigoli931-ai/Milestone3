package com.petwellness.controller;

import com.petwellness.dto.ApiResponse;
import com.petwellness.dto.VaccinationRequest;
import com.petwellness.entity.Pet;
import com.petwellness.entity.Vaccination;
import com.petwellness.repository.PetRepository;
import com.petwellness.repository.VaccinationRepository;
import com.petwellness.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/vaccinations")
@RequiredArgsConstructor
public class AdminVaccinationController {

    private final VaccinationRepository vaccinationRepository;
    private final PetRepository petRepository;
    private final ReminderService reminderService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Vaccination>>> getAllVaccinations() {
        List<Vaccination> records = vaccinationRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Vaccination records retrieved successfully", records));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVaccination(@PathVariable("id") Long id) {
        vaccinationRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Vaccination record deleted by admin"));
    }

    @PutMapping("/{id}/toggle-complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Vaccination>> toggleVaccinationStatus(@PathVariable("id") Long id) {
        Vaccination vax = vaccinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vaccination record not found"));
        vax.setCompleted(!vax.isCompleted());
        Vaccination updated = vaccinationRepository.save(vax);
        return ResponseEntity.ok(new ApiResponse<>(true, "Vaccination status updated", updated));
    }

    @PostMapping("/pets/{petId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Vaccination>> adminAddVaccination(@PathVariable("petId") Long petId,
            @RequestBody VaccinationRequest request) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        Vaccination vax = Vaccination.builder()
                .pet(pet)
                .vaccineName(request.getVaccineName())
                .dateGiven(request.getDateGiven())
                .nextDueDate(request.getNextDueDate())
                .batchNumber(request.getBatchNumber())
                .administeredBy(request.getAdministeredBy())
                .completed(false) // Default to pending if added by admin usually, or check request
                .build();

        Vaccination saved = vaccinationRepository.save(vax);
        reminderService.sendReminderImmediately(saved);
        return ResponseEntity.ok(new ApiResponse<>(true, "Vaccination record added by admin", saved));
    }
}
