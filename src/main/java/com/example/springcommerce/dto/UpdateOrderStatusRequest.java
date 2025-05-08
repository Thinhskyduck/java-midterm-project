// src/main/java/com/example/springcommerce/dto/UpdateOrderStatusRequest.java
package com.example.springcommerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    @NotBlank(message = "New status cannot be blank")
    private String newStatus;
}