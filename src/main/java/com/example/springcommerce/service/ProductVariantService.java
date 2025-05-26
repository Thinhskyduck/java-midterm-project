package com.example.springcommerce.service;

import com.example.springcommerce.dto.ProductVariantRequest;
import com.example.springcommerce.entity.ProductVariant;

import java.util.List;

public interface ProductVariantService {
    List<ProductVariant> getVariantsByProductId(Long productId);
    ProductVariant createVariant(ProductVariant variant);
    ProductVariant getVariantById(Long variantId);
    void deleteVariant(Long id);
    ProductVariant updateVariant(Long variantId, ProductVariantRequest variantDetails);

}

