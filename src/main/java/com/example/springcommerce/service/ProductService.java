// src/main/java/com/example/springcommerce/service/ProductService.java
package com.example.springcommerce.service;

import com.example.springcommerce.dto.ProductResponse; // <<<< SỬA: Service nên trả về DTO hoặc Page<DTO>
import com.example.springcommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
// import java.util.List; // Sẽ thay bằng Page

public interface ProductService {

    // Thay thế getAllProducts và filterProducts bằng phương thức này
    Page<Product> findFilteredProducts(
            Long categoryId, // << Đổi sang Long
            String brandName,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String nameKeyword,
            String color,
            Pageable pageable
    );

    Product getProductById(Long id);
    Product createProduct(Product product);
    Product updateProduct(Long id, Product product);
    void deleteProduct(Long id);

    // Bỏ phương thức này nếu gộp vào findFilteredProducts
    // List<Product> filterProducts(Long categoryId, Long brandId, BigDecimal minPrice, BigDecimal maxPrice, String keyword);

    // Bỏ phương thức này nếu gộp
    // List<Product> getAllProducts();
}