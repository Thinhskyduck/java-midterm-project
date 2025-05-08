package com.example.springcommerce.service;

import com.example.springcommerce.entity.ProductVariant;
import com.example.springcommerce.repository.ProductRepository;
import com.example.springcommerce.repository.ProductVariantRepository;
import lombok.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository variantRepo;
    private final ProductRepository productRepo;

    @Override
    public List<ProductVariant> getVariantsByProductId(Long productId) {
        return variantRepo.findByProductId(productId);
    }

    @Override
    public ProductVariant createVariant(ProductVariant variant) {
        return variantRepo.save(variant);
    }

    @Override
    public void deleteVariant(Long id) {
        variantRepo.deleteById(id);
    }
}

