// src/main/java/com/example/springcommerce/service/EmailService.java
package com.example.springcommerce.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress; // <<< THÊM IMPORT NÀY
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value; // <<< THÊM IMPORT NÀY
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException; // <<< THÊM IMPORT NÀY (cho tên cá nhân)

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Lấy địa chỉ email gửi từ application.properties
    // Điều này đảm bảo bạn sử dụng cùng một email đã cấu hình để gửi
    @Value("${spring.mail.username}")
    private String fromEmailAddress;

    private String senderName = "SpringEcommerce"; // Tên người gửi bạn muốn hiển thị

    @Async
    public void sendOtpEmail(String to, String userName, String otp) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        try {
            // Đặt địa chỉ "From" với tên cá nhân
            helper.setFrom(new InternetAddress(fromEmailAddress, senderName));
        } catch (UnsupportedEncodingException e) {
            // Xử lý lỗi nếu tên cá nhân có vấn đề về encoding (ít xảy ra với tên đơn giản)
            // Hoặc fallback về gửi không có tên cá nhân
            helper.setFrom(fromEmailAddress);
            System.err.println("Warning: Could not set sender name due to encoding issue. " + e.getMessage());
        }

        helper.setTo(to);
        helper.setSubject("Your Password Reset OTP for SpringCommerce"); // Bạn có thể thêm senderName vào subject nếu muốn

        String htmlContent = "<h3>Hello " + userName + ",</h3>"
                + "<p>You recently requested to reset your password for your " + senderName + " account.</p>" // Thêm senderName
                + "<p>Your One-Time Password (OTP) is: <strong>" + otp + "</strong></p>"
                + "<p>This OTP is valid for " + OtpService.getOtpValidityMinutes() + " minutes.</p>"
                + "<p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>"
                + "<br>"
                + "<p>Thank you,</p>"
                + "<p>The " + senderName + " Team</p>"; // Thêm senderName

        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
}