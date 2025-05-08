// src/main/java/com/example/springcommerce/dto/JwtAuthResponse.java
package com.example.springcommerce.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String username;
    // You can add roles or other user info here if needed

    public JwtAuthResponse(String accessToken, String username) {
        this.accessToken = accessToken;
        this.username = username;
    }
}