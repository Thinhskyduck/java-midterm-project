// src/main/java/com/example/springcommerce/service/ProductVariantServiceImpl.java
package com.example.springcommerce.service;

import com.example.springcommerce.dto.ProductVariantRequest;
import com.example.springcommerce.entity.ProductVariant;
import com.example.springcommerce.repository.ProductVariantRepository; // Đảm bảo import đúng
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor // Đảm bảo có, hoặc dùng @Autowired cho constructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository variantRepository; // final nếu dùng @RequiredArgsConstructor

    // Phương thức KHÔNG được là static
    @Override
    @Transactional
    public ProductVariant createVariant(ProductVariant variant) {
        return variantRepository.save(variant); // Gọi trên instance variantRepository
    }

    // Phương thức KHÔNG được là static
    @Override
    @Transactional(readOnly = true)
    public List<ProductVariant> getVariantsByProductId(Long productId) {
        // Giả sử ProductVariantRepository có phương thức này
        return variantRepository.findByProductId(productId);
    }

    // Phương thức KHÔNG được là static
    @Override
    @Transactional(readOnly = true)
    public ProductVariant getVariantById(Long variantId) {
        return variantRepository.findById(variantId) // Gọi trên instance variantRepository
                .orElseThrow(() -> new EntityNotFoundException("ProductVariant not found with id: " + variantId));
    }

    // Phương thức KHÔNG được là static
    @Override
    @Transactional
    public ProductVariant updateVariant(Long variantId, ProductVariantRequest requestDetails) {
        ProductVariant existingVariant = variantRepository.findById(variantId) // Gọi trên instance
                .orElseThrow(() -> new EntityNotFoundException("ProductVariant not found with id: " + variantId));

        if (requestDetails.getColor() != null) {
            existingVariant.setColor(requestDetails.getColor());
        }
        if (requestDetails.getPrice() != null) {
            existingVariant.setPrice(requestDetails.getPrice());
        }
        if (requestDetails.getStockQty() != null) {
            existingVariant.setStockQty(requestDetails.getStockQty());
        }
        if (requestDetails.getImageUrl() != null) {
            existingVariant.setImageUrl(requestDetails.getImageUrl());
        }

        return variantRepository.save(existingVariant); // Gọi trên instance
    }

    // Phương thức KHÔNG được là static
    @Override
    @Transactional
    public void deleteVariant(Long variantId) {
        if (!variantRepository.existsById(variantId)) { // Gọi trên instance
            throw new EntityNotFoundException("ProductVariant not found with id: " + variantId + " for deletion.");
        }
        variantRepository.deleteById(variantId); // Gọi trên instance
    }
}