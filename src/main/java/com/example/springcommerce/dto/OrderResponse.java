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
    private Long id; // Changed from Integer to Long
    private Long userId; // Changed from Integer to Long
    private String username;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;
}