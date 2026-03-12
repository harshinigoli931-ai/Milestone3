package com.petwellness.controller;

import com.petwellness.dto.ApiResponse;
import com.petwellness.entity.MedicalHistory;
import com.petwellness.repository.MedicalHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/medical-records")
@RequiredArgsConstructor
public class AdminMedicalController {

    private final MedicalHistoryRepository medicalHistoryRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MedicalHistory>>> getAllMedicalRecords() {
        List<MedicalHistory> records = medicalHistoryRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Medical records retrieved successfully", records));
    }
}
