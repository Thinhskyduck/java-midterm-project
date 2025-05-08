package com.example.springcommerce.service;

import com.example.springcommerce.entity.Product;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {
    List<Product> getAllProducts();
    Product getProductById(Long id);
    Product createProduct(Product product);
    Product updateProduct(Long id, Product product);
    void deleteProduct(Long id);
    List<Product> filterProducts(Long categoryId, Long brandId, BigDecimal minPrice, BigDecimal maxPrice, String keyword);

}
