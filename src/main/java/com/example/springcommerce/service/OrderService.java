// src/main/java/com/example/springcommerce/service/OrderService.java
package com.example.springcommerce.service;

import com.example.springcommerce.dto.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface OrderService {
    // Change Integer to Long here to match the implementation
    OrderResponse checkout(Long userId, String shippingAddress);
    // Add other order-related service methods here later (e.g., findOrderById, findOrdersByUser)
    OrderResponse getOrderById(Long orderId);

    // Option 1: Simple list (good for MVP if user orders are few)
    List<OrderResponse> getOrdersByUserId(Long userId);

    // Option 2: Paginated list (better for many orders)
    // Page<OrderResponse> getOrdersByUserId(Long userId, Pageable pageable);
    Page<OrderResponse> getOrdersByUserIdPaginated(Long userId, Pageable pageable);
    OrderResponse updateOrderStatus(Long orderId, String newStatus);
    // <<< PHƯƠNG THỨC MỚI CHO ADMIN >>>
    Page<OrderResponse> getAllOrders(Pageable pageable);
}