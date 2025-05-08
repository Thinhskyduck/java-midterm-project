package com.example.springcommerce.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddToCartRequest {
    private Long userId;
    private Long variantId;
    private Integer quantity;
}

