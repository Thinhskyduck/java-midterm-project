package com.example.springcommerce.service;

import com.example.springcommerce.entity.ProductVariant;

import java.util.List;

public interface ProductVariantService {
    List<ProductVariant> getVariantsByProductId(Long productId);
    ProductVariant createVariant(ProductVariant variant);
    void deleteVariant(Long id);
}

