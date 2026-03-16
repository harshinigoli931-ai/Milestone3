package com.petwellness.controller;

import com.petwellness.dto.ApiResponse;
import com.petwellness.dto.OrderRequest;
import com.petwellness.dto.OrderResponse;
import com.petwellness.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payment", description = "Razorpay payment integration")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    @Operation(summary = "Create a Razorpay order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Order created", paymentService.createRazorpayOrder(request)));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify payment and place order")
    public ResponseEntity<ApiResponse<OrderResponse>> verifyPayment(
            @RequestBody Map<String, Object> data,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Payment verified", paymentService.verifyAndPlaceOrder(data, authentication.getName())));
    }
}
