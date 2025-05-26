// src/main/java/com/example/springcommerce/service/ProductServiceImpl.java
package com.example.springcommerce.service;

import com.example.springcommerce.entity.Brand;
import com.example.springcommerce.entity.Category;
import com.example.springcommerce.entity.Product;
import com.example.springcommerce.repository.BrandRepository;
import com.example.springcommerce.repository.CategoryRepository;
import com.example.springcommerce.repository.ProductRepository;
import com.example.springcommerce.repository.specification.ProductSpecification; // <<< IMPORT SPECIFICATION
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification; // <<< IMPORT SPECIFICATION
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
// import java.util.List; // Không dùng List nữa

@Service
@RequiredArgsConstructor
@Transactional // Thêm Transactional ở mức class nếu hầu hết các method cần
public class ProductServiceImpl implements ProductService {

    @Autowired
    private final ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository; // Inject
    @Autowired
    private BrandRepository brandRepository;     // Inject
    @Override
    @Transactional(readOnly = true)
    public Page<Product> findFilteredProducts(
            Long categoryId, // << Đổi sang Long categoryId
            String categoryName,
            String brandName,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String nameKeyword,
            String color,
            Pageable pageable) {

        Category categoryEntity = null;
        if (categoryId != null) { // Ưu tiên categoryId nếu có
            categoryEntity = categoryRepository.findById(categoryId).orElse(null);
        } else if (categoryName != null && !categoryName.isEmpty() && !categoryName.equals("*")) {
            categoryEntity = categoryRepository.findByNameIgnoreCase(categoryName).orElse(null);
            // Nếu categoryName được gửi nhưng không tìm thấy, bạn có thể muốn trả về trang rỗng
            // if (categoryEntity == null) return Page.empty(pageable);
        }
        Brand brand = null;
        if (brandName != null && !brandName.isEmpty()) {
            brand = brandRepository.findByNameIgnoreCase(brandName).orElse(null);
            // Nếu brandName được cung cấp nhưng không tìm thấy brand, có thể bạn muốn trả về trang rỗng
            // if (brand == null) return Page.empty(pageable); // Ví dụ
        }

        Specification<Product> spec = ProductSpecification.filterBy(
                categoryEntity, // Truyền categoryId
                brand,      // Truyền Brand object (hoặc brandId nếu spec xử lý id)
                minPrice,
                maxPrice,
                nameKeyword,
                color
        );
        return productRepository.findAll(spec, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Product getProductById(Long id) { // Giữ nguyên hàm này để load variants
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        product.getVariants().size(); // Khởi tạo variants
        // product.getCategory(); // Có thể khởi tạo nếu cần, nhưng Specification sẽ xử lý join
        // product.getBrand();
        return product;
    }

    @Override
    public Product createProduct(Product product) {
        // Có thể thêm logic validate ở đây trước khi save
        return productRepository.save(product);
    }

    @Override
    public Product updateProduct(Long id, Product productDetails) {
        Product existingProduct = getProductById(id);
        existingProduct.setName(productDetails.getName());
        existingProduct.setDescription(productDetails.getDescription());
        existingProduct.setBasePrice(productDetails.getBasePrice());
        existingProduct.setImageUrl(productDetails.getImageUrl());
        // Khi cập nhật, đảm bảo category và brand là managed entities hoặc bạn chỉ set ID
        if (productDetails.getCategory() != null && productDetails.getCategory().getId() != null) {
            Category category = categoryRepository.findById(productDetails.getCategory().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found for update"));
            existingProduct.setCategory(category);
        } else {
            existingProduct.setCategory(null);
        }
        if (productDetails.getBrand() != null && productDetails.getBrand().getId() != null) {
            Brand brand = brandRepository.findById(productDetails.getBrand().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Brand not found for update"));
            existingProduct.setBrand(brand);
        } else {
            existingProduct.setBrand(null);
        }
        return productRepository.save(existingProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found with id: " + id + " for deletion.");
        }
        productRepository.deleteById(id);
    }
}