package com.example.springcommerce.controller;

import com.example.springcommerce.dto.ProductVariantRequest;
import com.example.springcommerce.dto.ProductVariantResponse;
import com.example.springcommerce.entity.Product;

import com.example.springcommerce.entity.ProductVariant;
import com.example.springcommerce.repository.ProductRepository;
import com.example.springcommerce.service.ProductVariantService;
import jakarta.persistence.EntityNotFoundException;
import lombok.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService variantService;
    private final ProductRepository productRepo;

    @PostMapping
    public ProductVariantResponse create(@RequestBody ProductVariantRequest request) {
        Product product = productRepo.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        ProductVariant variant = ProductVariant.builder()
                .color(request.getColor())
                .price(request.getPrice())
                .stockQty(request.getStockQty())
                .imageUrl(request.getImageUrl())
                .product(product)
                .build();

        ProductVariant saved = variantService.createVariant(variant);

        return ProductVariantResponse.builder()
                .id(saved.getId())
                .color(saved.getColor())
                .price(saved.getPrice())
                .stockQty(saved.getStockQty())
                .imageUrl(saved.getImageUrl())
                .productId(product.getId())
                .productName(product.getName())
                .build();
    }

    @GetMapping("/by-product/{productId}")
    public List<ProductVariantResponse> getByProduct(@PathVariable Long productId) {
        return variantService.getVariantsByProductId(productId)
                .stream()
                .map(v -> ProductVariantResponse.builder()
                        .id(v.getId())
                        .color(v.getColor())
                        .price(v.getPrice())
                        .stockQty(v.getStockQty())
                        .imageUrl(v.getImageUrl())
                        .productId(productId)
                        .productName(v.getProduct().getName())
                        .build())
                .collect(Collectors.toList());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        variantService.deleteVariant(id);
    }
}

