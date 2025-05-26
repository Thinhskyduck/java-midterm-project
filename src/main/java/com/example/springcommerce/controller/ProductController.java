// src/main/java/com/example/springcommerce/controller/ProductController.java
package com.example.springcommerce.controller;

import com.example.springcommerce.dto.ProductRequest;
import com.example.springcommerce.dto.ProductResponse;
import com.example.springcommerce.dto.ProductVariantResponse;
import com.example.springcommerce.entity.Brand;
import com.example.springcommerce.entity.Category;
import com.example.springcommerce.entity.Product;
import com.example.springcommerce.repository.BrandRepository; // Có thể không cần trực tiếp ở đây nữa
import com.example.springcommerce.repository.CategoryRepository; // Có thể không cần trực tiếp ở đây nữa
import com.example.springcommerce.service.ProductService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid; // <<< THÊM IMPORT CHO VALIDATION
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault; // <<< THÊM IMPORT
import org.springframework.http.HttpStatus; // <<< THÊM IMPORT
import org.springframework.http.ResponseEntity; // <<< THÊM IMPORT
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
// import java.util.List; // Không dùng List nữa
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    // Các repository này có thể không cần thiết nếu việc mapToEntity chuyển sang service
    // hoặc nếu các request không yêu cầu ID mà là tên (ví dụ categoryName)
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getFilteredProducts(
            @RequestParam(required = false) Long categoryId, // << Đổi sang Long
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String brandName,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String color,
            @PageableDefault(size = 9, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<Product> productPage = productService.findFilteredProducts(
                categoryId,categoryName, brandName, minPrice, maxPrice, name, color, pageable
        );
        Page<ProductResponse> productResponsePage = productPage.map(this::mapToResponse);
        System.out.println("Received Pageable in Controller - Sort: " + pageable.getSort());
        return ResponseEntity.ok(productResponsePage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(mapToResponse(product));
    }
    // Hàm mapToResponse của bạn cần xử lý việc map variants
    private ProductResponse mapToResponse(Product product) {
        if (product == null) return null;

        List<ProductVariantResponse> variantResponses = new ArrayList<>();
        if (product.getVariants() != null) { // Kiểm tra null cho an toàn
            variantResponses = product.getVariants().stream()
                    .map(variant -> ProductVariantResponse.builder()
                            .id(variant.getId())
                            .color(variant.getColor())
                            .price(variant.getPrice())
                            .stockQty(variant.getStockQty())
                            .imageUrl(variant.getImageUrl())
                            // Thêm các trường khác của ProductVariantResponse nếu có
                            .build())
                    .collect(Collectors.toList());
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .imageUrl(product.getImageUrl())
                .category(product.getCategory() != null ?
                        ProductResponse.CategoryInfo.builder()
                                .id(product.getCategory().getId())
                                .name(product.getCategory().getName())
                                .build() : null)
                .brand(product.getBrand() != null ?
                        ProductResponse.BrandInfo.builder()
                                .id(product.getBrand().getId())
                                .name(product.getBrand().getName())
                                .build() : null)
                .variants(variantResponses) // <<<< Đặt danh sách variant responses vào đây
                .build();
    }
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        // Việc mapToEntity nên được xử lý cẩn thận hơn, có thể là trong service
        // hoặc đảm bảo request DTO đủ thông tin để service tự xử lý.
        // Hiện tại giữ nguyên cách map này để bạn dễ theo dõi.
        Product product = mapToEntity(request);
        Product createdProduct = productService.createProduct(product);
        return new ResponseEntity<>(mapToResponse(createdProduct), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        Product productDetails = mapToEntity(request); // productDetails này chưa có ID
        Product updatedProduct = productService.updateProduct(id, productDetails);
        return ResponseEntity.ok(mapToResponse(updatedProduct));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // mapToEntity nên được xem xét lại.
    // Service nên nhận DTO hoặc các tham số thô, không nên nhận Entity đã được map sẵn ở Controller
    // nếu Entity đó chưa được quản lý bởi Persistence Context.
    // Tạm thời giữ nguyên để giảm thiểu thay đổi.
    private Product mapToEntity(ProductRequest request) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + request.getCategoryId()));
        }

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new EntityNotFoundException("Brand not found with ID: " + request.getBrandId()));
        }

        return Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .imageUrl(request.getImageUrl())
                .category(category)
                .brand(brand)
                // Variants không được map ở đây, cần xử lý riêng
                .build();
    }
}