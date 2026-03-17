package com.petwellness.service;

import com.petwellness.dto.OrderRequest;
import com.petwellness.dto.OrderResponse;
import com.petwellness.entity.*;
import com.petwellness.entity.enums.OrderStatus;
import com.petwellness.exception.BadRequestException;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.repository.OrderRepository;
import com.petwellness.repository.ProductRepository;
import com.petwellness.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final MarketplaceService marketplaceService;

    public PaymentService(ProductRepository productRepository, 
                          OrderRepository orderRepository, 
                          UserRepository userRepository,
                          MarketplaceService marketplaceService) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.marketplaceService = marketplaceService;
    }

    public Map<String, Object> createRazorpayOrder(OrderRequest request) {
        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            BigDecimal totalAmount = BigDecimal.ZERO;
            for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));
                totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
            }

            // Convert to Paise
            int amountInPaise = totalAmount.multiply(new BigDecimal(100)).intValue();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("id", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("key", razorpayKeyId);

            return response;
        } catch (RazorpayException e) {
            throw new BadRequestException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    @Transactional
    public OrderResponse verifyAndPlaceOrder(Map<String, Object> data, String userEmail) {
        String razorpayOrderId = (String) data.get("razorpay_order_id");
        String razorpayPaymentId = (String) data.get("razorpay_payment_id");
        String razorpaySignature = (String) data.get("razorpay_signature");

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!isValid) {
                throw new BadRequestException("Invalid payment signature");
            }

            // Extract order details from response data (passed from frontend)
            Map<String, Object> orderData = (Map<String, Object>) data.get("order_details");
            OrderRequest orderRequest = mapToOrderRequest(orderData);

            User owner = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            OrderResponse response = marketplaceService.placeOrder(owner.getId(), orderRequest);
            
            // Update the order with Razorpay details
            com.petwellness.entity.Order dbOrder = orderRepository.findById(response.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
            
            dbOrder.setRazorpayOrderId(razorpayOrderId);
            dbOrder.setTransactionId(razorpayPaymentId);
            dbOrder.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(dbOrder);

            return marketplaceService.getOrderHistory(owner.getId()).get(0); // Return the updated order (first in history)
            
        } catch (Exception e) {
            throw new BadRequestException("Payment verification failed: " + e.getMessage());
        }
    }

    private OrderRequest mapToOrderRequest(Map<String, Object> data) {
        OrderRequest request = new OrderRequest();
        request.setShippingAddress((String) data.get("shippingAddress"));
        request.setAddressId(data.get("addressId") != null ? Long.valueOf(data.get("addressId").toString()) : null);
        request.setPaymentMethod("RAZORPAY");
        
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) data.get("items");
        List<OrderRequest.OrderItemRequest> items = new ArrayList<>();
        
        for (Map<String, Object> itemMap : itemsData) {
            OrderRequest.OrderItemRequest item = new OrderRequest.OrderItemRequest();
            item.setProductId(Long.valueOf(itemMap.get("productId").toString()));
            item.setQuantity(Integer.valueOf(itemMap.get("quantity").toString()));
            items.add(item);
        }
        
        request.setItems(items);
        return request;
    }
}
