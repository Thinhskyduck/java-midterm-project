package com.example.springcommerce.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    private String name;
    private String description;
    private BigDecimal basePrice;
    private String imageUrl;
    private Long categoryId;
    private Long brandId;
}

