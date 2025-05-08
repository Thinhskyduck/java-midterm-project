// src/main/java/com/example/springcommerce/dto/RegisterRequest.java
package com.example.springcommerce.dto;

import com.example.springcommerce.entity.Role; // Assuming you have a Role enum
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    @NotBlank
    @Size(max = 100)
    private String fullName;

    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    private String address; // Optional at registration

    @NotNull(message = "Role cannot be null")
    private Role role = Role.CUSTOMER; // Default to CUSTOMER
}