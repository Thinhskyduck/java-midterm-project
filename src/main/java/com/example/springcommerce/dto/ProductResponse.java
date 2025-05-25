// src/main/java/com/example/springcommerce/dto/ProductResponse.java
package com.example.springcommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List; // Cho variants

@Data
@Builder
@NoArgsConstructor // Cần thiết nếu bạn dùng @AllArgsConstructor cho inner class
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal basePrice;
    private String imageUrl;
    // private String categoryName; // Bỏ cái này
    // private String brandName;    // Bỏ cái này

    private CategoryInfo category; // <<< THAY ĐỔI
    private BrandInfo brand;       // <<< THAY ĐỔI

    private List<ProductVariantResponse> variants; // <<< THÊM ĐỂ HIỂN THỊ VARIANT (NẾU CẦN)

    // Inner classes for nested info
    @Data
    @Builder
    @NoArgsConstructor  // Thêm NoArgsConstructor
    @AllArgsConstructor // Thêm AllArgsConstructor để đảm bảo có public constructor
    public static class CategoryInfo {
        private Long id;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BrandInfo {
        private Long id;
        private String name;
    }
}