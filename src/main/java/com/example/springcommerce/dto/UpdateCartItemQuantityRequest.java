// src/main/java/com/example/springcommerce/dto/UpdateCartItemQuantityRequest.java
package com.example.springcommerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCartItemQuantityRequest {
    @NotNull(message = "User ID cannot be null") // To verify ownership or if cart is user-specific
    private Long userId;

    @NotNull(message = "New quantity cannot be null")
    @Min(value = 1, message = "Quantity must be at least 1") // Usually, to update, quantity is >= 1. To remove, use removeFromCart.
    private Integer newQuantity;
}