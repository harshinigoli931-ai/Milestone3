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

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = "http://localhost:5173")
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

    @PostMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new product")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product created", marketplaceService.createProduct(request)));
    }

/*
    @PutMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing product")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(@PathVariable("id") Long id,
            @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product updated", marketplaceService.updateProduct(id, request)));
    }
*/

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate a product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable("id") Long id) {
        marketplaceService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deactivated"));
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

    @GetMapping("/orders/{id}")
    @PreAuthorize("hasRole('PET_OWNER') or hasRole('ADMIN')")
    @Operation(summary = "Get full order details")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order details", marketplaceService.getOrderById(id)));
    }

    @PutMapping("/orders/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Order status updated",
                        marketplaceService.updateOrderStatus(id, status)
                )
        );
    }

    @PutMapping("/orders/{id}/cancel")
    @PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @RequestParam String reason,
            Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Order cancelled successfully",
                        marketplaceService.cancelOrder(user.getId(), id, reason)
                )
        );
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
