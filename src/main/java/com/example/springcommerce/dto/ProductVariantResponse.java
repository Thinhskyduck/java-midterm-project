package com.example.springcommerce.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantResponse {
    private Long id;
    private String color;
    private BigDecimal price;
    private Integer stockQty;
    private String imageUrl;
    private Long productId;
    private String productName;
}

