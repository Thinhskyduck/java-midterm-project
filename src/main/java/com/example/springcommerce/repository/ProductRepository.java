// src/main/java/com/example/springcommerce/repository/ProductRepository.java
package com.example.springcommerce.repository;

import com.example.springcommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // <<< THÊM IMPORT NÀY
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> { // <<< KẾ THỪA JpaSpecificationExecutor
    // Các phương thức query tùy chỉnh khác nếu có
}