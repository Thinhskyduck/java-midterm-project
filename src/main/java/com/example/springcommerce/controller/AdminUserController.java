// src/main/java/com/example/springcommerce/controller/AdminUserController.java
package com.example.springcommerce.controller;

import com.example.springcommerce.dto.AdminUpdateUserRequest;
import com.example.springcommerce.dto.UserDto;
import com.example.springcommerce.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Cho bảo mật
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users") // Base path cho admin user management
@PreAuthorize("hasRole('ADMIN')")    // Tất cả các endpoint trong controller này yêu cầu ADMIN role
public class AdminUserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<UserDto> usersPage = userService.getAllUsers(pageable);
        return ResponseEntity.ok(usersPage);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long userId) {
        UserDto userDto = userService.getUserByIdByAdmin(userId);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUpdateUserRequest updateUserRequest) {
        UserDto updatedUser = userService.updateUserByAdmin(userId, updateUserRequest);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        // Trước khi xóa, có thể kiểm tra xem admin có đang cố xóa chính mình không
        // Hoặc có các business rule khác (ví dụ: không xóa user có đơn hàng đang xử lý)
        userService.deleteUserByAdmin(userId);
        return ResponseEntity.ok(java.util.Map.of("message", "User deleted successfully.")); // Hoặc noContent()
    }
}