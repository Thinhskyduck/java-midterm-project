// src/main/java/com/example/springcommerce/service/OtpService.java
package com.example.springcommerce.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap; // Thread-safe Map

@Service
public class OtpService {

    private static final int OTP_VALIDITY_MINUTES = 10; // Thời gian OTP hợp lệ (phút)
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>(); // Key: email (lowercase), Value: OtpData

    private static class OtpData {
        String code;
        LocalDateTime expiryTime;

        OtpData(String code, LocalDateTime expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }
    }

    /**
     * Tạo và lưu trữ OTP cho một email.
     * @param email Email của người dùng.
     * @return Mã OTP đã tạo.
     */
    public String generateAndStoreOtp(String email) {
        cleanupExpiredOtps(); // Dọn dẹp OTP cũ trước khi tạo mới (tùy chọn)

        String otp = generateOtpString();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);
        otpStorage.put(email.toLowerCase(), new OtpData(otp, expiryTime));
        return otp;
    }

    /**
     * Xác thực OTP cho một email.
     * @param email Email của người dùng.
     * @param otp Mã OTP người dùng nhập.
     * @return true nếu OTP hợp lệ, false nếu ngược lại.
     */
    public boolean validateOtp(String email, String otp) {
        OtpData storedOtpData = otpStorage.get(email.toLowerCase());
        if (storedOtpData == null) {
            return false; // Không tìm thấy OTP cho email này
        }

        // Kiểm tra hết hạn
        if (storedOtpData.expiryTime.isBefore(LocalDateTime.now())) {
            otpStorage.remove(email.toLowerCase()); // OTP đã hết hạn, xóa đi
            return false;
        }

        // Kiểm tra mã OTP
        if (storedOtpData.code.equals(otp)) {
            otpStorage.remove(email.toLowerCase()); // OTP hợp lệ, xóa đi sau khi sử dụng
            return true;
        }

        return false; // OTP không khớp
    }

    /**
     * Tạo một chuỗi OTP ngẫu nhiên gồm 6 chữ số.
     * @return Chuỗi OTP.
     */
    private String generateOtpString() {
        Random random = new Random();
        // Tạo số từ 100000 đến 999999
        int otpNumber = 100000 + random.nextInt(900000);
        return String.valueOf(otpNumber);
    }

    /**
     * Dọn dẹp các OTP đã hết hạn khỏi bộ nhớ.
     * Phương thức này có thể được gọi định kỳ nếu cần,
     * hoặc trước khi tạo OTP mới để giữ bộ nhớ gọn gàng.
     */
    public void cleanupExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        // Sử dụng removeIf để xóa các entry thỏa mãn điều kiện (hết hạn)
        otpStorage.entrySet().removeIf(entry -> entry.getValue().expiryTime.isBefore(now));
    }

    /**
     * Lấy thời gian hiệu lực của OTP (tính bằng phút).
     * @return Thời gian hiệu lực của OTP.
     */
    public static int getOtpValidityMinutes() {
        return OTP_VALIDITY_MINUTES;
    }
}