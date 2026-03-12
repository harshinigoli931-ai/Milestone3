package com.petwellness.controller;

import com.petwellness.dto.ApiResponse;
import com.petwellness.dto.ReviewRequest;
import com.petwellness.dto.ReviewResponse;
import com.petwellness.entity.User;
import com.petwellness.repository.UserRepository;
import com.petwellness.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Reviews", description = "Manage product reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    public ReviewController(ReviewService reviewService, UserRepository userRepository) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('PET_OWNER')")
    @Operation(summary = "Submit a product review")
    public ResponseEntity<ApiResponse<ReviewResponse>> submitReview(@RequestBody ReviewRequest request,
                                                                  Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(ApiResponse.success("Review submitted",
                reviewService.submitReview(user.getId(), request)));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get reviews for a product")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByProduct(@PathVariable("productId") Long productId) {
        return ResponseEntity.ok(ApiResponse.success("Product reviews",
                reviewService.getReviewsByProduct(productId)));
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
