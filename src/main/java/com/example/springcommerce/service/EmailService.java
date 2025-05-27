// src/main/java/com/example/springcommerce/service/EmailService.java
package com.example.springcommerce.service;

import com.example.springcommerce.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress; // <<< THÊM IMPORT NÀY
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value; // <<< THÊM IMPORT NÀY
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.example.springcommerce.entity.Order; // Import Order entity
import com.example.springcommerce.entity.OrderItem;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.io.UnsupportedEncodingException; // <<< THÊM IMPORT NÀY (cho tên cá nhân)
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Lấy địa chỉ email gửi từ application.properties
    // Điều này đảm bảo bạn sử dụng cùng một email đã cấu hình để gửi
    @Value("${spring.mail.username}")
    private String fromEmailAddress;

    private String senderName = "Telescope Store"; // Tên người gửi bạn muốn hiển thị

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

        String htmlContent = String.format("""
        <div style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h2 style="color: #2c3e50;">Xin chào <span style="color: #2980b9;">%s</span>,</h2>
        
                <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản <strong>%s</strong>.</p>
    
                <p style="font-size: 16px;">Mã xác thực (OTP) của bạn là:</p>
    
                <div style="font-size: 24px; font-weight: bold; color: #e74c3c; text-align: center; margin: 20px 0;">
                    %s
                </div>
      
                <p>Mã OTP này có hiệu lực trong <strong>%d phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
   
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ bộ phận hỗ trợ của chúng tôi nếu bạn có bất kỳ thắc mắc nào.</p>
 
                <br>
                <p>Trân trọng,</p>
                <p>Đội ngũ <strong>%s</strong></p>
  
                <hr style="margin-top: 30px; border: none; border-top: 1px solid #ccc;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Đây là email tự động. Vui lòng không trả lời email này.
                </p>
            </div>
        </div>
        """, userName, senderName, otp, OtpService.getOtpValidityMinutes(), senderName);



        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    // <<< PHƯƠNG THỨC MỚI ĐỂ GỬI EMAIL XÁC NHẬN ĐƠN HÀNG >>>
    @Async
    public void sendOrderConfirmationEmail(User user, Order order) throws MessagingException {
        if (user == null || order == null || user.getEmail() == null) {
            System.err.println("Cannot send order confirmation: user or order data is missing.");
            return;
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8"); // true = multipart, UTF-8 for Vietnamese

        try {
            helper.setFrom(new InternetAddress(fromEmailAddress, senderName));
        } catch (UnsupportedEncodingException e) {
            helper.setFrom(fromEmailAddress);
        }

        helper.setTo(user.getEmail());
        helper.setSubject("Your SpringCommerce Order Confirmation - #" + order.getId());

        // Định dạng tiền tệ và ngày tháng
        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("HH:mm 'ngày' dd/MM/yyyy");

        // Xây dựng nội dung email (HTML)
        StringBuilder emailContent = new StringBuilder();
        emailContent.append("<html><body style='font-family: Arial, sans-serif; color: #333;'>");
        emailContent.append("<div style='max-width: 700px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>");

        emailContent.append("<h2 style='color: #2c3e50;'>Xin chào ").append(user.getFullName() != null ? user.getFullName() : user.getUsername()).append(",</h2>");
        emailContent.append("<p>Cảm ơn bạn đã đặt hàng tại <strong>SpringCommerce</strong>. Chúng tôi đã nhận được đơn hàng của bạn!</p>");

        emailContent.append("<p><strong>Mã đơn hàng:</strong> #").append(order.getId()).append("<br>");
        emailContent.append("<strong>Ngày đặt hàng:</strong> ").append(order.getCreatedAt().format(dateFormatter)).append("<br>");
        emailContent.append("<strong>Địa chỉ giao hàng:</strong> ").append(order.getShippingAddress()).append("<br>");
        emailContent.append("<strong>Phương thức thanh toán:</strong> Thanh toán khi nhận hàng (COD)</p>");

        emailContent.append("<h3 style='color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 5px;'>Chi tiết đơn hàng</h3>");
        emailContent.append("<table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>");
        emailContent.append("<thead>");
        emailContent.append("<tr style='background-color: #f7f7f7;'>");
        emailContent.append("<th style='padding: 10px; border: 1px solid #ddd;'>Sản phẩm</th>");
        emailContent.append("<th style='padding: 10px; border: 1px solid #ddd;'>Màu sắc</th>");
        emailContent.append("<th style='padding: 10px; border: 1px solid #ddd;'>Số lượng</th>");
        emailContent.append("<th style='padding: 10px; border: 1px solid #ddd;'>Đơn giá</th>");
        emailContent.append("<th style='padding: 10px; border: 1px solid #ddd;'>Thành tiền</th>");
        emailContent.append("</tr>");
        emailContent.append("</thead>");
        emailContent.append("<tbody>");

        for (OrderItem item : order.getOrderItems()) {
            emailContent.append("<tr>");
            emailContent.append("<td style='padding: 10px; border: 1px solid #ddd;'>").append(item.getVariant().getProduct().getName()).append("</td>");
            emailContent.append("<td style='padding: 10px; border: 1px solid #ddd;'>").append(item.getVariant().getColor()).append("</td>");
            emailContent.append("<td style='padding: 10px; border: 1px solid #ddd; text-align:center;'>").append(item.getQuantity()).append("</td>");
            emailContent.append("<td style='padding: 10px; border: 1px solid #ddd; text-align:right;'>").append(currencyFormatter.format(item.getUnitPrice())).append("</td>");
            emailContent.append("<td style='padding: 10px; border: 1px solid #ddd; text-align:right;'>").append(currencyFormatter.format(item.getUnitPrice().multiply(new BigDecimal(item.getQuantity())))).append("</td>");
            emailContent.append("</tr>");
        }

        emailContent.append("</tbody>");
        emailContent.append("</table>");

        emailContent.append("<h3 style='text-align: right; margin-top: 20px; color: #e74c3c;'>Tổng tiền: ").append(currencyFormatter.format(order.getTotalAmount())).append("</h3>");

        emailContent.append("<p style='margin-top: 20px;'>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận thông tin giao hàng. Nếu bạn có bất kỳ câu hỏi nào, hãy phản hồi lại email này hoặc liên hệ bộ phận hỗ trợ của chúng tôi.</p>");
        emailContent.append("<p>Trân trọng,<br><strong>Đội ngũ ").append(senderName).append("</strong></p>");

        emailContent.append("</div>");
        emailContent.append("</body></html>");


        helper.setText(emailContent.toString(), true); // true indicates HTML email
        mailSender.send(message);
        System.out.println("Order confirmation email sent to: " + user.getEmail() + " for order ID: " + order.getId());
    }
}