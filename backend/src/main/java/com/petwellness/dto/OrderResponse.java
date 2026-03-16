package com.petwellness.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private BigDecimal totalAmount;
    private String status;
    private String shippingAddress;
    private String ownerEmail;
    private LocalDateTime createdAt;
    private String transactionId;
    private String paymentStatus;
    private String paymentMethod;
    private LocalDateTime expectedDeliveryDate;
    private String cancellationReason;
    private AddressDetails deliveryAddress;
    private List<OrderItemResponse> items;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AddressDetails {
        private String fullName;
        private String phone;
        private String street;
        private String city;
        private String state;
        private String postalCode;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private String productName;
        private String productImageUrl;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
