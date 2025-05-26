// src/test/java/com/example/springcommerce/service/ProductVariantServiceImplTest.java
package com.example.springcommerce.service;

import com.example.springcommerce.dto.ProductVariantRequest;
import com.example.springcommerce.entity.Product;
import com.example.springcommerce.entity.ProductVariant;
import com.example.springcommerce.repository.ProductVariantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductVariantServiceImplTest {

    @Mock
    private ProductVariantRepository variantRepository;

    @InjectMocks
    private ProductVariantServiceImpl variantService;

    @Test
    void createVariant_ShouldReturnSavedVariant_WhenValid() {
        // Arrange
        Product product = new Product();
        product.setId(1L);
        ProductVariant variant = ProductVariant.builder()
                .color("Blue")
                .price(BigDecimal.valueOf(99.99))
                .stockQty(10)
                .imageUrl("image.jpg")
                .product(product)
                .build();
        when(variantRepository.save(any(ProductVariant.class))).thenReturn(variant);

        // Act
        ProductVariant result = variantService.createVariant(variant);

        // Assert
        assertNotNull(result);
        assertEquals("Blue", result.getColor());
        assertEquals(BigDecimal.valueOf(99.99), result.getPrice());
        verify(variantRepository, times(1)).save(variant);
    }

    @Test
    void getVariantsByProductId_ShouldReturnListOfVariants_WhenProductIdExists() {
        // Arrange
        Long productId = 1L;
        Product product = new Product();
        product.setId(productId);
        ProductVariant variant = ProductVariant.builder()
                .id(1L)
                .color("Blue")
                .product(product)
                .build();
        List<ProductVariant> variants = Collections.singletonList(variant);
        when(variantRepository.findByProductId(productId)).thenReturn(variants);

        // Act
        List<ProductVariant> result = variantService.getVariantsByProductId(productId);

        // Assert
        assertEquals(1, result.size());
        assertEquals("Blue", result.get(0).getColor());
        verify(variantRepository, times(1)).findByProductId(productId);
    }

    @Test
    void updateVariant_ShouldUpdateAndReturnVariant_WhenValidRequest() {
        // Arrange
        Long variantId = 1L;
        ProductVariantRequest request = new ProductVariantRequest();
        request.setColor("Red");
        request.setPrice(BigDecimal.valueOf(149.99));
        request.setStockQty(20);
        request.setImageUrl("updated-image.jpg");

        Product product = new Product();
        product.setId(1L);
        ProductVariant existingVariant = ProductVariant.builder()
                .id(variantId)
                .color("Blue")
                .price(BigDecimal.valueOf(99.99))
                .stockQty(10)
                .imageUrl("image.jpg")
                .product(product)
                .build();

        ProductVariant updatedVariant = ProductVariant.builder()
                .id(variantId)
                .color("Red")
                .price(BigDecimal.valueOf(149.99))
                .stockQty(20)
                .imageUrl("updated-image.jpg")
                .product(product)
                .build();

        when(variantRepository.findById(variantId)).thenReturn(Optional.of(existingVariant));
        when(variantRepository.save(any(ProductVariant.class))).thenReturn(updatedVariant);

        // Act
        ProductVariant result = variantService.updateVariant(variantId, request);

        // Assert
        assertEquals("Red", result.getColor());
        assertEquals(BigDecimal.valueOf(149.99), result.getPrice());
        assertEquals(20, result.getStockQty());
        assertEquals("updated-image.jpg", result.getImageUrl());
        verify(variantRepository, times(1)).findById(variantId);
        verify(variantRepository, times(1)).save(any(ProductVariant.class));
    }

    @Test
    void deleteVariant_ShouldThrowException_WhenVariantDoesNotExist() {
        // Arrange
        Long variantId = 1L;
        when(variantRepository.existsById(variantId)).thenReturn(false);

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> variantService.deleteVariant(variantId));
        verify(variantRepository, times(1)).existsById(variantId);
        verify(variantRepository, never()).deleteById(variantId);
    }
}