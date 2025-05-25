// src/main/java/com/example/springcommerce/service/AuthService.java
package com.example.springcommerce.service;

import com.example.springcommerce.config.JwtTokenProvider;
import com.example.springcommerce.dto.JwtAuthResponse;
import com.example.springcommerce.dto.LoginRequest;
import com.example.springcommerce.dto.RegisterRequest;
import com.example.springcommerce.entity.Role;
import com.example.springcommerce.entity.User;
import com.example.springcommerce.exception.AppException;
import com.example.springcommerce.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.springcommerce.entity.User; // Import User entity

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtTokenProvider tokenProvider;
    @Autowired
    private EmailService emailService; // Đã có
    @Autowired
    private OtpService otpService;     // Thêm OtpService

    public String registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Username is already taken!");
        }
        if (userRepository.existsByEmail(registerRequest.getEmail().toLowerCase())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email Address already in use!");
        }
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName());
        user.setEmail(registerRequest.getEmail().toLowerCase()); // Lưu email bằng chữ thường
        user.setAddress(registerRequest.getAddress());
        user.setRole(registerRequest.getRole() != null ? registerRequest.getRole() : Role.CUSTOMER);
        userRepository.save(user);
        return "User registered successfully!";
    }

    public JwtAuthResponse loginUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        // Lấy User object để có userId
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "User not found after authentication. This should not happen."));

        return new JwtAuthResponse(jwt, user.getId(), user.getUsername()); // Trả về cả userId
    }

    public String requestPasswordResetOtp(String email) {
        String normalizedEmail = email.toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User with this email not found."));

        String otp = otpService.generateAndStoreOtp(normalizedEmail);

        try {
            emailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);
            return "OTP has been sent to your email. Please check your inbox (valid for " + OtpService.getOtpValidityMinutes() + " minutes).";
        } catch (MessagingException e) {
            // Không cần xóa OTP khỏi OtpService ở đây vì nó sẽ tự hết hạn
            // hoặc bị ghi đè nếu user yêu cầu lại.
            // Log lỗi để theo dõi
            System.err.println("Error sending OTP email: " + e.getMessage());
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP email. Please try again later.");
        }
    }

    @Transactional // Cần transactional vì có thao tác cập nhật database (mật khẩu)
    public String resetPasswordWithOtp(String email, String otp, String newPassword) {
        String normalizedEmail = email.toLowerCase();
        // Bước 1: Xác thực OTP
        if (!otpService.validateOtp(normalizedEmail, otp)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Invalid or expired OTP.");
        }

        // Bước 2: Nếu OTP hợp lệ, tìm user và cập nhật mật khẩu
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "User not found after OTP validation. This indicates a potential issue."));
        // Lỗi này không nên xảy ra nếu OTP chỉ được tạo cho email đã tồn tại.

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        // OtpService.validateOtp đã xóa OTP nếu hợp lệ

        return "Password has been reset successfully.";
    }
}