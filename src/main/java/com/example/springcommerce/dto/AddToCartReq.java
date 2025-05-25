// src/main/java/com/example/springcommerce/dto/AddToCartReq.java
package com.example.springcommerce.dto;

import com.fasterxml.jackson.annotation.JsonProperty; // <<< IMPORT
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddToCartReq {

    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @JsonProperty("productVariantId") // << ÁNH XẠ TỪ JSON KEY "productVariantId"
    @NotNull(message = "Product Variant ID cannot be null")
    private Long variantId; // Tên trường Java là variantId

    @NotNull(message = "Quantity cannot be null")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}