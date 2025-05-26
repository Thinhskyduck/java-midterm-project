// src/main/java/com/example/springcommerce/dto/UserDto.java
package com.example.springcommerce.dto;

import com.example.springcommerce.entity.Role; // Import Role
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
    private Role role; // << THÊM ROLE ĐỂ ADMIN CÓ THỂ XEM VÀ SERVICE CÓ THỂ MAP
}