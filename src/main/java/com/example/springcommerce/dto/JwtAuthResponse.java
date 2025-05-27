// src/main/java/com/example/springcommerce/dto/JwtAuthResponse.java
package com.example.springcommerce.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long userId; // << THÊM TRƯỜNG NÀY
    private String username;
    private String fullName; // <<< THÊM TRƯỜNG NÀY

    public JwtAuthResponse(String accessToken, Long userId, String username, String fullName) {
        this.accessToken = accessToken;
        this.userId = userId;
        this.username = username;
        this.fullName = fullName; // << GÁN GIÁ TRỊ
    }
}