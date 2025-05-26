// src/main/java/com/example/springcommerce/dto/AdminUpdateUserRequest.java
package com.example.springcommerce.dto;

import com.example.springcommerce.entity.Role; // Enum Role của bạn
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {

    // Username không cho sửa bởi admin để đảm bảo tính nhất quán
    // private String username;

    @NotBlank(message = "Full name cannot be blank")
    @Size(max = 100)
    private String fullName;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    @Size(max = 100)
    private String email;

    private String address; // Địa chỉ có thể null

    @NotNull(message = "Role cannot be null")
    private Role role; // Admin có thể thay đổi vai trò
}