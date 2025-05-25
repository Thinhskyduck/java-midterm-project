package com.example.springcommerce.repository;

import com.example.springcommerce.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    boolean existsByName(String name);
    Optional<Brand> findByNameIgnoreCase(String name); // <<< THÊM PHƯƠNG THỨC NÀY
}

