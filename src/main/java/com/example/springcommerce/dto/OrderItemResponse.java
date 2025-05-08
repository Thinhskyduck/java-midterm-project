// src/main/java/com/example/springcommerce/dto/OrderItemResponse.java
package com.example.springcommerce.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private Long id; // Changed from Integer to Long
    private Long productVariantId; // Assuming ProductVariant.id is Long
    private String productName;
    private String productVariantColor;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}