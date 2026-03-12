package com.petwellness.service;

import com.petwellness.dto.ReviewRequest;
import com.petwellness.dto.ReviewResponse;
import com.petwellness.entity.Order;
import com.petwellness.entity.Product;
import com.petwellness.entity.Review;
import com.petwellness.entity.User;
import com.petwellness.entity.enums.OrderStatus;
import com.petwellness.exception.BadRequestException;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.repository.OrderRepository;
import com.petwellness.repository.ProductRepository;
import com.petwellness.repository.ReviewRepository;
import com.petwellness.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository,
                         OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public ReviewResponse submitReview(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check if user has a DELIVERED order for this product
        List<Order> userOrders = orderRepository.findByOwnerIdOrderByCreatedAtDesc(userId);
        boolean hasDeliveredOrder = userOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .anyMatch(o -> o.getItems().stream()
                        .anyMatch(item -> item.getProduct().getId().equals(request.getProductId())));

        if (!hasDeliveredOrder) {
            throw new BadRequestException("You can only review products that have been delivered to you.");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);
        return mapToReviewResponse(review);
    }

    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        String firstName = review.getUser().getPersonalInformation() != null ? review.getUser().getPersonalInformation().getFirstName() : "User";
        String lastName = review.getUser().getPersonalInformation() != null ? review.getUser().getPersonalInformation().getLastName() : "";
        
        return ReviewResponse.builder()
                .id(review.getId())
                .userName(firstName + " " + lastName)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
