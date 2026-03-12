package com.petwellness.controller;

import com.petwellness.dto.*;
import com.petwellness.entity.User;
import com.petwellness.repository.UserRepository;
import com.petwellness.service.PetService;
import com.petwellness.service.PdfReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
@PreAuthorize("hasRole('PET_OWNER')")
@Tag(name = "Pet Management", description = "Manage pet profiles, medical history, and vaccinations")
public class PetController {

    private final PetService petService;
    private final UserRepository userRepository;
    private final PdfReportService pdfReportService;

    public PetController(PetService petService, UserRepository userRepository, PdfReportService pdfReportService) {
        this.petService = petService;
        this.userRepository = userRepository;
        this.pdfReportService = pdfReportService;
    }

    @GetMapping
    @Operation(summary = "List all pets for the owner")
    public ResponseEntity<ApiResponse<List<PetResponse>>> getMyPets(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(ApiResponse.success("Pets retrieved", petService.getPetsByOwner(user.getId())));
    }

    @GetMapping("/{petId}")
    @Operation(summary = "Get pet details with medical history and vaccinations")
    public ResponseEntity<ApiResponse<PetResponse>> getPet(@PathVariable("petId") Long petId,
            Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(ApiResponse.success("Pet retrieved", petService.getPetById(user.getId(), petId)));
    }

    @PostMapping
    @Operation(summary = "Add a new pet")
    public ResponseEntity<ApiResponse<PetResponse>> addPet(@RequestBody PetRequest request,
            Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(ApiResponse.success("Pet added", petService.addPet(user.getId(), request)));
    }

    @PutMapping("/{petId}")
    @Operation(summary = "Update pet details")
    public ResponseEntity<ApiResponse<PetResponse>> updatePet(@PathVariable("petId") Long petId,
            @RequestBody PetRequest request,
            Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity
                .ok(ApiResponse.success("Pet updated", petService.updatePet(user.getId(), petId, request)));
    }

    @DeleteMapping("/{petId}")
    @Operation(summary = "Delete a pet")
    public ResponseEntity<ApiResponse<Void>> deletePet(@PathVariable("petId") Long petId,
            Authentication authentication) {
        User user = getUser(authentication);
        petService.deletePet(user.getId(), petId);
        return ResponseEntity.ok(ApiResponse.success("Pet deleted"));
    }

    @PostMapping("/{petId}/medical-history")
    @Operation(summary = "Add medical history record")
    public ResponseEntity<ApiResponse<PetResponse.MedicalHistoryResponse>> addMedicalHistory(
            @PathVariable("petId") Long petId, @RequestBody MedicalHistoryRequest request,
            Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(ApiResponse.success("Medical record added",
                petService.addMedicalHistory(user.getId(), petId, request)));
    }

    @PostMapping("/{petId}/vaccinations")
    @Operation(summary = "Add vaccination record")
    public ResponseEntity<ApiResponse<PetResponse.VaccinationResponse>> addVaccination(
            @PathVariable("petId") Long petId, @RequestBody VaccinationRequest request, Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(ApiResponse.success("Vaccination added",
                petService.addVaccination(user.getId(), petId, request)));
    }

    @DeleteMapping("/{petId}/vaccinations/{vaccinationId}")
    @Operation(summary = "Delete vaccination record")
    public ResponseEntity<ApiResponse<Void>> deleteVaccination(@PathVariable("petId") Long petId,
            @PathVariable("vaccinationId") Long vaccinationId, Authentication authentication) {
        User user = getUser(authentication);
        petService.deleteVaccination(user.getId(), petId, vaccinationId);
        return ResponseEntity.ok(ApiResponse.success("Vaccination deleted"));
    }

    @GetMapping("/{petId}/health-report")
    @Operation(summary = "Download Health Report PDF")
    public ResponseEntity<byte[]> downloadHealthReport(@PathVariable("petId") Long petId,
            Authentication authentication) {
        User user = getUser(authentication);
        PetResponse pet = petService.getPetById(user.getId(), petId);
        try {
            byte[] pdfBytes = pdfReportService.generateHealthReport(pet);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "health-report-" + petId + ".pdf");
            return new ResponseEntity<>(pdfBytes, headers, org.springframework.http.HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
