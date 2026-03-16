package com.petwellness.controller;

import com.petwellness.dto.AddressRequest;
import com.petwellness.dto.ApiResponse;
import com.petwellness.entity.Address;
import com.petwellness.service.AddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/addresses")
@CrossOrigin(origins = "http://localhost:5173")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<ApiResponse<Address>> saveAddress(
            @RequestBody AddressRequest request,
            Authentication authentication) {

        System.out.println("Processing saveAddress request...");
        System.out.println("Authentication: " + authentication);
        if (authentication != null) {
            System.out.println("User: " + authentication.getName());
            System.out.println("Authorities: " + authentication.getAuthorities());
        }

        Address address = addressService.saveAddress(authentication.getName(), request);

        return ResponseEntity.ok(
                ApiResponse.success("Address saved successfully", address)
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<ApiResponse<List<Address>>> getAddresses(Authentication authentication) {
        List<Address> addresses = addressService.getUserAddresses(authentication.getName());
        return ResponseEntity.ok(
                ApiResponse.success("Addresses fetched successfully", addresses)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<ApiResponse<Address>> updateAddress(
            @PathVariable Long id,
            @RequestBody AddressRequest request) {
        Address address = addressService.updateAddress(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Address updated successfully", address)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(
                ApiResponse.success("Address deleted successfully")
        );
    }
}
