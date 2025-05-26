// src/main/java/com/example/springcommerce/controller/ProductVariantController.java
package com.example.springcommerce.controller;

import com.example.springcommerce.dto.ProductVariantRequest;
import com.example.springcommerce.dto.ProductVariantResponse;
import com.example.springcommerce.entity.Product;
import com.example.springcommerce.entity.ProductVariant;
import com.example.springcommerce.repository.ProductRepository; // Cần cho create
import com.example.springcommerce.service.ProductVariantService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid; // Thêm cho validation
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus; // Thêm
import org.springframework.http.ResponseEntity; // Thêm
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/variants") // Giữ nguyên base path này
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService variantService;
    private final ProductRepository productRepo; // Cần cho POST (create)

    // Helper để map Entity sang Response DTO
    private ProductVariantResponse mapToResponse(ProductVariant variant) {
        if (variant == null) return null;
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .color(variant.getColor())
                .price(variant.getPrice())
                .stockQty(variant.getStockQty())
                .imageUrl(variant.getImageUrl())
                .productId(variant.getProduct() != null ? variant.getProduct().getId() : null)
                .productName(variant.getProduct() != null ? variant.getProduct().getName() : null)
                .build();
    }

    // POST /api/variants (để tạo variant mới cho một product)
    @PostMapping
    public ResponseEntity<ProductVariantResponse> createVariant(@Valid @RequestBody ProductVariantRequest request) {
        Product product = productRepo.findById(request.getProductId()) // productId phải có trong request
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + request.getProductId() + " when creating variant."));

        ProductVariant newVariant = ProductVariant.builder()
                .color(request.getColor())
                .price(request.getPrice())
                .stockQty(request.getStockQty())
                .imageUrl(request.getImageUrl())
                .product(product) // Gán product cha
                .build();

        ProductVariant savedVariant = variantService.createVariant(newVariant);
        return new ResponseEntity<>(mapToResponse(savedVariant), HttpStatus.CREATED);
    }

    // GET /api/variants/by-product/{productId}
    @GetMapping("/by-product/{productId}")
    public ResponseEntity<List<ProductVariantResponse>> getVariantsByProductId(@PathVariable Long productId) {
        // Kiểm tra product tồn tại nếu cần
        if (!productRepo.existsById(productId)) {
            throw new EntityNotFoundException("Product not found with id: " + productId + " when fetching variants.");
        }
        List<ProductVariantResponse> responses = variantService.getVariantsByProductId(productId)
                .stream()
                .map(this::mapToResponse) // Dùng helper
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // GET /api/variants/{id} (Lấy chi tiết một variant)
    @GetMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> getVariantById(@PathVariable Long id) {
        ProductVariant variant = variantService.getVariantById(id);
        return ResponseEntity.ok(mapToResponse(variant));
    }


    // PUT /api/variants/{id} (Cập nhật variant) << ENDPOINT MỚI
    @PutMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> updateVariant(
            @PathVariable Long id,
            @Valid @RequestBody ProductVariantRequest requestDetails) {
        // ProductVariantRequest không cần productId ở đây vì variantId đã xác định variant
        // Service sẽ không cho thay đổi productId của variant hiện có
        ProductVariant updatedVariant = variantService.updateVariant(id, requestDetails);
        return ResponseEntity.ok(mapToResponse(updatedVariant));
    }


    // DELETE /api/variants/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVariant(@PathVariable Long id) {
        variantService.deleteVariant(id);
        return ResponseEntity.noContent().build();
    }
}