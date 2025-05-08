// src/main/java/com/example/springcommerce/dto/CheckoutRequest.java
package com.example.springcommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotNull(message = "User ID cannot be null")
    private Long userId; // Changed from Integer to Long

//    @NotBlank(message = "Shipping address cannot be blank")
    private String shippingAddress;
}