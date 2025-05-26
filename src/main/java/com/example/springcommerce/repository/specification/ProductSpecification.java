// src/main/java/com/example/springcommerce/repository/specification/ProductSpecification.java (Tạo package specification nếu chưa có)
package com.example.springcommerce.repository.specification;

import com.example.springcommerce.entity.Product;
import com.example.springcommerce.entity.Category; // Import Category
import com.example.springcommerce.entity.Brand;    // Import Brand
import com.example.springcommerce.entity.ProductVariant;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterBy(
            Category category,     // <<< THAY ĐỔI: Nhận Long categoryId
            Brand brand,           // <<< THAY ĐỔI: Nhận Brand object
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String nameKeyword,
            String color) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (nameKeyword != null && !nameKeyword.isEmpty()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + nameKeyword.toLowerCase() + "%"));
            }

            // Lọc theo categoryId trực tiếp
            if (category != null) { // Lọc theo Category object
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            // Lọc theo Brand object
            if (brand != null) {
                predicates.add(criteriaBuilder.equal(root.get("brand"), brand));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("basePrice"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("basePrice"), maxPrice));
            }

            if (color != null && !color.isEmpty()) {
                query.distinct(true); // Quan trọng để tránh trùng lặp sản phẩm
                Join<Product, ProductVariant> variantsJoin = root.join("variants", JoinType.INNER);
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(variantsJoin.get("color")), color.toLowerCase()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}