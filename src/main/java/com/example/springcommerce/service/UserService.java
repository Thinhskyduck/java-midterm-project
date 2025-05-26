// src/main/java/com/example/springcommerce/service/UserService.java
package com.example.springcommerce.service;

import com.example.springcommerce.dto.AdminUpdateUserRequest;
import com.example.springcommerce.dto.UserDto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

public interface UserService {
    UserDto getUserByUsername(String username);
    // Các method khác nếu cần
    void updateUserAddress(String username, String newAddress); // Phương thức mới
    // <<< ADMIN OPERATIONS >>>
    Page<UserDto> getAllUsers(Pageable pageable);
    UserDto getUserByIdByAdmin(Long userId); // Để phân biệt với việc user tự lấy thông tin
    UserDto updateUserByAdmin(Long userId, AdminUpdateUserRequest updateUserRequest);
    void deleteUserByAdmin(Long userId);
}