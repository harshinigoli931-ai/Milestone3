package com.petwellness.service;

import com.petwellness.dto.*;
import com.petwellness.entity.*;
import com.petwellness.entity.enums.OrderStatus;
import com.petwellness.entity.enums.ProductCategory;
import com.petwellness.exception.BadRequestException;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketplaceService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final EmailService emailService;

    public MarketplaceService(ProductRepository productRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            AddressRepository addressRepository,
            EmailService emailService) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.emailService = emailService;
    }

    // ========== Admin: Product Management ==========

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(ProductCategory.valueOf(request.getCategory()))
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .active(true)
                .build();
        product = productRepository.save(product);
        return mapToProductResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long productId, ProductRequest request) {
        System.out.println("Updating product ID: " + productId + " with request: " + request);
        try {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

            if (request.getName() != null && !request.getName().trim().isEmpty())
                product.setName(request.getName());
            
            if (request.getDescription() != null)
                product.setDescription(request.getDescription());
            
            if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
                try {
                    product.setCategory(ProductCategory.valueOf(request.getCategory().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    throw new BadRequestException("Invalid product category: " + request.getCategory());
                }
            }
            
            if (request.getPrice() != null)
                product.setPrice(request.getPrice());
            
            if (request.getStock() != null)
                product.setStock(request.getStock());
            
            if (request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty())
                product.setImageUrl(request.getImageUrl());

            product = productRepository.save(product);
            System.out.println("Product updated successfully: " + product.getId());
            return mapToProductResponse(product);
        } catch (Exception e) {
            System.err.println("Error updating product: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setActive(false);
        productRepository.save(product);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(OrderStatus.valueOf(status));
        order = orderRepository.save(order);

        // Send Order Status Update Email (Asynchronous to prevent lag)
        try {
            final String targetEmail = order.getOwner().getEmail();
            final String updatedStatus = status;
            final Long orderNum = order.getId();

            // Prepare non-lazy variables for inside the thread
            String itemsTitle = "Product";
            String firstItemImage = null;
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                OrderItem first = order.getItems().get(0);
                itemsTitle = first.getProduct().getName();
                firstItemImage = first.getProduct().getImageUrl();
                if (order.getItems().size() > 1) {
                    itemsTitle += " (+ " + (order.getItems().size() - 1) + " more)";
                }
            }
            
            String expectedDate = null;
            if (order.getExpectedDeliveryDate() != null) {
                expectedDate = order.getExpectedDeliveryDate().toLocalDate().format(
                    java.time.format.DateTimeFormatter.ofPattern("EEE, MMM dd")
                );
            }

            final String fTitle = itemsTitle;
            final String fImage = firstItemImage;
            final String fDate = expectedDate;

            new Thread(() -> {
                try {
                    // Small sleep for transaction commit safety
                    Thread.sleep(1000); 
                    emailService.sendOrderStatusUpdateEmail(targetEmail, orderNum, updatedStatus, fTitle, fImage, fDate);
                } catch (Exception ex) {
                    System.err.println("Async order update email failed: " + ex.getMessage());
                }
            }).start();
        } catch (Exception e) {
            System.err.println("Failed to initiate order update email: " + e.getMessage());
        }

        return mapToResponse(order);
    }

    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return mapToResponse(order);
    }

    // ========== Owner: Browsing & Ordering ==========

    public List<ProductResponse> getAllProducts() {
        return productRepository.findByActiveTrue().stream()
                .map(this::mapToProductResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(ProductCategory.valueOf(category)).stream()
                .map(this::mapToProductResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(query).stream()
                .map(this::mapToProductResponse).collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse placeOrder(Long ownerId, OrderRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));

            if (!product.isActive()) {
                throw new BadRequestException("Product is not available: " + product.getName());
            }

            if (product.getStock() < itemReq.getQuantity()) {
                throw new BadRequestException("Insufficient stock for: " + product.getName());
            }

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getPrice())
                    .totalPrice(itemTotal)
                    .build();
            orderItems.add(item);

            // Reduce stock
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);
        }

        Order order = Order.builder()
                .owner(owner)
                .totalAmount(totalAmount)
                .status(OrderStatus.CONFIRMED)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(request.getPaymentMethod().equals("COD") ? "PENDING" : "PAID")
                .deliveryAddressId(request.getAddressId())
                .shippingAddress(request.getShippingAddress())
                .expectedDeliveryDate(LocalDateTime.now().plusDays(5)) // Expected: +5 days
                .items(new ArrayList<>())
                .build();
        order = orderRepository.save(order);

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);
        order = orderRepository.save(order);

        // Send order confirmation email
        emailService.sendOrderConfirmationEmail(order);

        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long userId, Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized cancellation");
        }

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException("Order cannot be cancelled after shipping");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(reason);
        order = orderRepository.save(order);
        return mapToResponse(order);
    }

    public List<OrderResponse> getOrderHistory(Long ownerId) {
        return orderRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    private ProductResponse mapToProductResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId()).name(p.getName()).description(p.getDescription())
                .category(p.getCategory().name()).price(p.getPrice())
                .stock(p.getStock()).imageUrl(p.getImageUrl())
                .active(p.isActive()).build();
    }

    private OrderResponse mapToResponse(Order o) {
        OrderResponse.AddressDetails addressDetails = null;
        if (o.getDeliveryAddressId() != null) {
            Address addr = addressRepository.findById(o.getDeliveryAddressId()).orElse(null);
            if (addr != null) {
                addressDetails = OrderResponse.AddressDetails.builder()
                        .fullName(addr.getFullName())
                        .phone(addr.getPhone())
                        .street(addr.getStreet())
                        .city(addr.getCity())
                        .state(addr.getState())
                        .postalCode(addr.getPostalCode())
                        .build();
            }
        }

        return OrderResponse.builder()
                .id(o.getId())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus().name())
                .shippingAddress(o.getShippingAddress())
                .ownerEmail(o.getOwner().getEmail())
                .createdAt(o.getCreatedAt())
                .transactionId(o.getTransactionId())
                .paymentStatus(o.getPaymentStatus())
                .paymentMethod(o.getPaymentMethod())
                .expectedDeliveryDate(o.getExpectedDeliveryDate())
                .cancellationReason(o.getCancellationReason())
                .deliveryAddress(addressDetails)
                .items(o.getItems().stream()
                        .map(i -> OrderResponse.OrderItemResponse.builder()
                                .id(i.getId())
                                .productName(i.getProduct().getName())
                                .productImageUrl(i.getProduct().getImageUrl())
                                .quantity(i.getQuantity())
                                .unitPrice(i.getUnitPrice())
                                .totalPrice(i.getTotalPrice())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
