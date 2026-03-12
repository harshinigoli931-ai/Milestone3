package com.petwellness.controller;

import com.petwellness.dto.*;
import com.petwellness.entity.User;
import com.petwellness.repository.UserRepository;
import com.petwellness.service.MarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@Tag(name = "Marketplace", description = "Browse products and place orders")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;
    private final UserRepository userRepository;

    public MarketplaceController(MarketplaceService marketplaceService, UserRepository userRepository) {
        this.marketplaceService = marketplaceService;
        this.userRepository = userRepository;
    }

    @GetMapping("/products")
    @Operation(summary = "List all active products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        return ResponseEntity.ok(ApiResponse.success("Products", marketplaceService.getAllProducts()));
    }

    @GetMapping("/products/category/{category}")
    @Operation(summary = "List products by category")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getByCategory(@PathVariable("category") String category) {
        return ResponseEntity.ok(ApiResponse.success("Products by category",
                marketplaceService.getProductsByCategory(category)));
    }

    @GetMapping("/products/search")
    @Operation(summary = "Search products by name")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> searchProducts(@RequestParam("query") String query) {
        return ResponseEntity.ok(ApiResponse.success("Search results", marketplaceService.searchProducts(query)));
    }

    @PostMapping("/orders")
    @PreAuthorize("hasRole('PET_OWNER')")
    @Operation(summary = "Place an order")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(@RequestBody OrderRequest request,
            Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(ApiResponse.success("Order placed",
                marketplaceService.placeOrder(user.getId(), request)));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasRole('PET_OWNER')")
    @Operation(summary = "Get order history")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrderHistory(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(ApiResponse.success("Order history",
                marketplaceService.getOrderHistory(user.getId())));
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
