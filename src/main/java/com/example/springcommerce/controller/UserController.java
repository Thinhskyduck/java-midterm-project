// src/main/java/com/example/springcommerce/controller/UserController.java
package com.example.springcommerce.controller;

import com.example.springcommerce.dto.UpdateUserAddressRequest;
import com.example.springcommerce.dto.UserDto; // Tạo DTO này
import com.example.springcommerce.entity.User;
import com.example.springcommerce.service.UserService; // Tạo Service này
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // Để lấy user đang đăng nhập
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // API để lấy thông tin người dùng đang đăng nhập
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        UserDto userDto = userService.getUserByUsername(userDetails.getUsername());
        return ResponseEntity.ok(userDto);
    }
    // API MỚI: Cập nhật địa chỉ của người dùng đang đăng nhập
    @PutMapping("/me/address")
    public ResponseEntity<?> updateUserAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateUserAddressRequest addressRequest) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            userService.updateUserAddress(userDetails.getUsername(), addressRequest.getNewAddress());
            return ResponseEntity.ok(Map.of("message", "Address updated successfully.")); // Trả về Map
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update address."));
        }
    }
    // (Sau này có thể thêm API PUT /api/users/me để cập nhật profile)
}