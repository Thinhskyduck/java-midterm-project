// src/main/java/com/example/springcommerce/service/UserService.java
package com.example.springcommerce.service;

import com.example.springcommerce.dto.UserDto;

public interface UserService {
    UserDto getUserByUsername(String username);
    // Các method khác nếu cần
    void updateUserAddress(String username, String newAddress); // Phương thức mới
}