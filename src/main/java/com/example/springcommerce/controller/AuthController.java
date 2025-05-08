// src/main/java/com/example/springcommerce/controller/AuthController.java
package com.example.springcommerce.controller;

import com.example.springcommerce.dto.JwtAuthResponse;
import com.example.springcommerce.dto.LoginRequest;
import com.example.springcommerce.dto.RegisterRequest;
import com.example.springcommerce.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        String result = authService.registerUser(registerRequest);
        // Trả về một object JSON thay vì String thuần
        return new ResponseEntity<>(new SimpleMessageResponse(result), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse jwtAuthResponse = authService.loginUser(loginRequest);
        return ResponseEntity.ok(jwtAuthResponse);
    }

    // DTOs cho forgot/reset password bằng OTP
    @Data
    static class RequestOtpRequest {
        @NotBlank(message = "Email cannot be blank")
        @Email(message = "Email should be valid")
        private String email;
    }

    @Data
    static class ResetPasswordWithOtpRequest {
        @NotBlank(message = "Email cannot be blank")
        @Email(message = "Email should be valid")
        private String email;

        @NotBlank(message = "OTP cannot be blank")
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        private String otp;

        @NotBlank(message = "New password cannot be blank")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String newPassword;
    }

    // Helper DTO cho response message đơn giản
    @Data
    @AllArgsConstructor
    static class SimpleMessageResponse {
        private String message;
    }


    @PostMapping("/request-password-otp")
    public ResponseEntity<SimpleMessageResponse> requestPasswordOtp(@Valid @RequestBody RequestOtpRequest request) {
        String message = authService.requestPasswordResetOtp(request.getEmail());
        return ResponseEntity.ok(new SimpleMessageResponse(message));
    }

    @PostMapping("/reset-password-otp") // Đổi tên endpoint để phân biệt với reset bằng link (nếu có)
    public ResponseEntity<SimpleMessageResponse> resetPasswordWithOtp(@Valid @RequestBody ResetPasswordWithOtpRequest request) {
        String message = authService.resetPasswordWithOtp(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(new SimpleMessageResponse(message));
    }
}