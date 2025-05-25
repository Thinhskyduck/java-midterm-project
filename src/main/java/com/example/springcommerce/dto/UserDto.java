// src/main/java/com/example/springcommerce/dto/UserDto.java
package com.example.springcommerce.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String address;
    // Không bao gồm password
}