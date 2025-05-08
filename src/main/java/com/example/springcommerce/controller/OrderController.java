// src/main/java/com/example/springcommerce/controller/OrderController.java
package com.example.springcommerce.controller;

import com.example.springcommerce.dto.CheckoutRequest;
import com.example.springcommerce.dto.OrderResponse;
import com.example.springcommerce.dto.UpdateOrderStatusRequest; // New DTO for status update
import com.example.springcommerce.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
// For Pageable
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkoutOrder(@Valid @RequestBody CheckoutRequest checkoutRequest) {
        OrderResponse orderResponse = orderService.checkout(
                checkoutRequest.getUserId(),
                checkoutRequest.getShippingAddress()
        );
        return new ResponseEntity<>(orderResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse orderResponse = orderService.getOrderById(id);
        return ResponseEntity.ok(orderResponse);
    }

    // Endpoint to get orders for a specific user
    // Example: GET /api/orders?userId=1
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrdersByUserId(@RequestParam Long userId) {
        // TODO: When security is implemented, this userId should ideally come from the authenticated principal
        // or be validated that the authenticated user is requesting their own orders or is an admin.
        List<OrderResponse> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    // If using Pageable for getOrdersByUserId:
    /*
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getOrdersByUserId(
            @RequestParam Long userId,
            @PageableDefault(size = 10, sort = "createdAt,desc") Pageable pageable) {
        Page<OrderResponse> ordersPage = orderService.getOrdersByUserId(userId, pageable);
        return ResponseEntity.ok(ordersPage);
    }
    */


    // Endpoint to update order status (typically for Admin)
    // Example: PUT /api/orders/5/status with request body {"newStatus": "SHIPPED"}
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest statusRequest) { // Use a DTO for the request body
        OrderResponse updatedOrder = orderService.updateOrderStatus(id, statusRequest.getNewStatus());
        return ResponseEntity.ok(updatedOrder);
    }

    // Optional: Endpoint for admin to get all orders (consider pagination)
    /*
    @GetMapping("/all") // Example path
    // @PreAuthorize("hasRole('ADMIN')") // When security is added
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @PageableDefault(size = 10, sort = "createdAt,desc") Pageable pageable) {
        Page<OrderResponse> ordersPage = orderService.getAllOrders(pageable); // Add getAllOrders to service
        return ResponseEntity.ok(ordersPage);
    }
    */
}