// src/main/java/com/example/springcommerce/dto/UpdateUserAddressRequest.java
package com.example.springcommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserAddressRequest {
    @NotBlank(message = "New address cannot be blank")
    @Size(max = 255, message = "Address cannot be longer than 255 characters")
    private String newAddress;
}