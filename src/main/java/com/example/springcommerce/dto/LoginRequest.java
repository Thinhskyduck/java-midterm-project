// src/main/java/com/example/springcommerce/dto/LoginRequest.java
package com.example.springcommerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;
}