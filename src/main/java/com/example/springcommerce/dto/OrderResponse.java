// src/main/java/com/example/springcommerce/dto/OrderResponse.java
package com.example.springcommerce.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private Long userId;
    private String username; // Giữ lại username nếu cần
    private String userFullName; // <<< THÊM MỚI
    private String userEmail;    // <<< THÊM MỚI
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;
}