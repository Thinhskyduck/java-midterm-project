// src/main/java/com/example/springcommerce/config/CacheConfig.java
package com.example.springcommerce.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching // Kích hoạt Spring Caching
public class CacheConfig {

    public static final String OTP_CACHE = "otpCache";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(OTP_CACHE);
        // Cấu hình cache cho OTP, ví dụ: hết hạn sau 5 phút
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES) // OTP hết hạn sau 5 phút
                .maximumSize(1000)); // Giới hạn số lượng OTP trong cache
        return cacheManager;
    }
}