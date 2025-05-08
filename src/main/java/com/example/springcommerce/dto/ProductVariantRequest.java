package com.example.springcommerce.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantRequest {
    private String color;
    private BigDecimal price;
    private Integer stockQty;
    private String imageUrl;
    private Long productId;
}

