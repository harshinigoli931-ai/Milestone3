package com.petwellness.controller;

import com.petwellness.dto.*;
import com.petwellness.entity.AppointmentSlot;
import com.petwellness.entity.User;
import com.petwellness.service.AdminService;
import com.petwellness.service.ApiKeyService;
import com.petwellness.service.AppointmentService;
import com.petwellness.service.MarketplaceService;
import com.petwellness.service.PetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin management endpoints")
public class AdminController {

    private final AdminService adminService;
    private final ApiKeyService apiKeyService;
    private final AppointmentService appointmentService;
    private final MarketplaceService marketplaceService;
    private final com.petwellness.repository.UserRepository userRepository;
    private final PetService petService;

    public AdminController(AdminService adminService, ApiKeyService apiKeyService,
            AppointmentService appointmentService, MarketplaceService marketplaceService,
            com.petwellness.repository.UserRepository userRepository, PetService petService) {
        this.adminService = adminService;
        this.apiKeyService = apiKeyService;
        this.appointmentService = appointmentService;
        this.marketplaceService = marketplaceService;
        this.userRepository = userRepository;
        this.petService = petService;
    }

    // ========== User Management ==========

    @PostMapping("/owners")
    @Operation(summary = "Create a new pet owner account")
    public ResponseEntity<ApiResponse<String>> createOwner(@Valid @RequestBody CreateOwnerRequest request) {
        adminService.createOwner(request);
        return ResponseEntity.ok(ApiResponse.success("Owner created. Credentials sent via email."));
    }

    @PostMapping("/owners/{userId}/approve")
    @Operation(summary = "Approve pending owner registration")
    public ResponseEntity<ApiResponse<String>> approveRegistration(@PathVariable("userId") Long userId) {
        adminService.approveRegistration(userId);
        return ResponseEntity.ok(ApiResponse.success("Registration approved"));
    }

    @PostMapping("/owners/{userId}/reject")
    @Operation(summary = "Reject pending owner registration")
    public ResponseEntity<ApiResponse<String>> rejectRegistration(@PathVariable("userId") Long userId) {
        adminService.rejectRegistration(userId);
        return ResponseEntity.ok(ApiResponse.success("Registration rejected"));
    }

    @GetMapping("/owners/pending")
    @Operation(summary = "List pending registrations")
    public ResponseEntity<ApiResponse<List<OwnerProfileResponse>>> getPendingRegistrations() {
        List<OwnerProfileResponse> pending = adminService.getPendingRegistrations().stream()
                .map(u -> OwnerProfileResponse.builder()
                        .userId(u.getId()).email(u.getEmail())
                        .accountStatus(u.getAccountStatus().name()).build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Pending registrations", pending));
    }

    @GetMapping("/users")
    @Operation(summary = "List all users")
    public ResponseEntity<ApiResponse<List<OwnerProfileResponse>>> getAllUsers() {
        List<OwnerProfileResponse> users = adminService.getAllUsers().stream()
                .map(u -> OwnerProfileResponse.builder()
                        .userId(u.getId()).email(u.getEmail())
                        .accountStatus(u.getAccountStatus().name()).build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("All users", users));
    }

    // ========== Pet Management ==========

    @GetMapping("/pets")
    @Operation(summary = "List all pets from all users")
    public ResponseEntity<ApiResponse<List<PetResponse>>> getAllPets() {
        return ResponseEntity.ok(ApiResponse.success("All pets", petService.getAllPetsForAdmin()));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get overall pet and user statistics")
    public ResponseEntity<ApiResponse<StatisticsResponse>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success("Pet statistics", adminService.getStatistics()));
    }

    // ========== Appointment Slot Management ==========

    @PostMapping("/slots")
    @Operation(summary = "Create an appointment slot")
    public ResponseEntity<ApiResponse<AppointmentSlot>> createSlot(@RequestBody AppointmentSlotRequest request) {
        AppointmentSlot slot = appointmentService.createSlot(request);
        return ResponseEntity.ok(ApiResponse.success("Slot created", slot));
    }

    @PutMapping("/slots/{slotId}")
    @Operation(summary = "Update an appointment slot")
    public ResponseEntity<ApiResponse<AppointmentSlot>> updateSlot(@PathVariable("slotId") Long slotId,
            @RequestBody AppointmentSlotRequest request) {
        AppointmentSlot slot = appointmentService.updateSlot(slotId, request);
        return ResponseEntity.ok(ApiResponse.success("Slot updated", slot));
    }

    @DeleteMapping("/slots/{slotId}")
    @Operation(summary = "Delete an appointment slot")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(@PathVariable("slotId") Long slotId) {
        appointmentService.deleteSlot(slotId);
        return ResponseEntity.ok(ApiResponse.success("Slot deleted"));
    }

    @PutMapping("/slots/{slotId}/toggle")
    @Operation(summary = "Toggle slot availability")
    public ResponseEntity<ApiResponse<AppointmentSlot>> toggleSlot(@PathVariable("slotId") Long slotId) {
        AppointmentSlot slot = appointmentService.toggleSlotAvailability(slotId);
        return ResponseEntity.ok(ApiResponse.success("Slot toggled", slot));
    }

    @GetMapping("/slots")
    @Operation(summary = "List all appointment slots")
    public ResponseEntity<ApiResponse<List<AppointmentSlot>>> getAllSlots() {
        return ResponseEntity.ok(ApiResponse.success("All slots", appointmentService.getAllSlots()));
    }

    @GetMapping("/appointments")
    @Operation(summary = "List all appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAllAppointments() {
        return ResponseEntity.ok(ApiResponse.success("All appointments", appointmentService.getAllAppointments()));
    }

    @GetMapping("/orders")
    @Operation(summary = "List all orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success("All orders", marketplaceService.getAllOrders()));
    }

    @PutMapping("/orders/{orderId}/status")
    @Operation(summary = "Update order status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(@PathVariable("orderId") Long orderId,
            @RequestParam("status") String status) {
        return ResponseEntity.ok(ApiResponse.success("Order status updated", 
            marketplaceService.updateOrderStatus(orderId, status)));
    }

    // ========== API Key Management ==========

    @PostMapping("/api-keys")
    @Operation(summary = "Generate a new API key")
    public ResponseEntity<ApiResponse<ApiKeyResponse>> generateApiKey(@RequestBody ApiKeyRequest request,
            Authentication authentication) {
        User admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity
                .ok(ApiResponse.success("API key generated", apiKeyService.generateApiKey(admin.getId(), request)));
    }

    @GetMapping("/api-keys")
    @Operation(summary = "List all API keys")
    public ResponseEntity<ApiResponse<List<ApiKeyResponse>>> listApiKeys(Authentication authentication) {
        User admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity.ok(ApiResponse.success("API keys", apiKeyService.listApiKeys(admin.getId())));
    }

    @DeleteMapping("/api-keys/{keyId}")
    @Operation(summary = "Revoke an API key")
    public ResponseEntity<ApiResponse<Void>> revokeApiKey(@PathVariable("keyId") Long keyId) {
        apiKeyService.revokeApiKey(keyId);
        return ResponseEntity.ok(ApiResponse.success("API key revoked"));
    }
}
