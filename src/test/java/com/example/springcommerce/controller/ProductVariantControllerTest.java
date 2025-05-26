// src/test/java/com/example/springcommerce/controller/ProductVariantControllerTest.java
package com.example.springcommerce.controller;

import com.example.springcommerce.dto.ProductVariantRequest;
import com.example.springcommerce.dto.ProductVariantResponse;
import com.example.springcommerce.entity.Product;
import com.example.springcommerce.entity.ProductVariant;
import com.example.springcommerce.repository.ProductRepository;
import com.example.springcommerce.service.ProductVariantService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductVariantControllerTest {

    @Mock
    private ProductVariantService variantService;

    @Mock
    private ProductRepository productRepo;

    @InjectMocks
    private ProductVariantController variantController;

    @Test
    void createVariant_ShouldReturnCreatedVariant_WhenRequestIsValid() {
        // Arrange
        ProductVariantRequest request = new ProductVariantRequest();
        request.setProductId(1L);
        request.setColor("Blue");
        request.setPrice(BigDecimal.valueOf(99.99));
        request.setStockQty(10);
        request.setImageUrl("image.jpg");

        Product product = new Product();
        product.setId(1L);
        product.setName("Test Product");

        ProductVariant variant = ProductVariant.builder()
                .id(1L)
                .color("Blue")
                .price(BigDecimal.valueOf(99.99))
                .stockQty(10)
                .imageUrl("image.jpg")
                .product(product)
                .build();

        ProductVariantResponse response = ProductVariantResponse.builder()
                .id(1L)
                .color("Blue")
                .price(BigDecimal.valueOf(99.99))
                .stockQty(10)
                .imageUrl("image.jpg")
                .productId(1L)
                .productName("Test Product")
                .build();

        when(productRepo.findById(1L)).thenReturn(Optional.of(product));
        when(variantService.createVariant(any(ProductVariant.class))).thenReturn(variant);

        // Act
        ResponseEntity<ProductVariantResponse> result = variantController.createVariant(request);

        // Assert
        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertEquals(response.getId(), result.getBody().getId());
        assertEquals(response.getColor(), result.getBody().getColor());
        verify(productRepo, times(1)).findById(1L);
        verify(variantService, times(1)).createVariant(any(ProductVariant.class));
    }

    @Test
    void getVariantsByProductId_ShouldReturnListOfVariants_WhenProductExists() {
        // Arrange
        Long productId = 1L;
        Product product = new Product();
        product.setId(productId);
        product.setName("Test Product");

        ProductVariant variant = ProductVariant.builder()
                .id(1L)
                .color("Blue")
                .price(BigDecimal.valueOf(99.99))
                .stockQty(10)
                .imageUrl("image.jpg")
                .product(product)
                .build();

        ProductVariantResponse response = ProductVariantResponse.builder()
                .id(1L)
                .color("Blue")
                .price(BigDecimal.valueOf(99.99))
                .stockQty(10)
                .imageUrl("image.jpg")
                .productId(productId)
                .productName("Test Product")
                .build();

        when(productRepo.existsById(productId)).thenReturn(true);
        when(variantService.getVariantsByProductId(productId)).thenReturn(Collections.singletonList(variant));

        // Act
        ResponseEntity<List<ProductVariantResponse>> result = variantController.getVariantsByProductId(productId);

        // Assert
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(1, result.getBody().size());
        assertEquals(response.getId(), result.getBody().get(0).getId());
        verify(productRepo, times(1)).existsById(productId);
        verify(variantService, times(1)).getVariantsByProductId(productId);
    }

    @Test
    void updateVariant_ShouldReturnUpdatedVariant_WhenRequestIsValid() {
        // Arrange
        Long variantId = 1L;
        ProductVariantRequest request = new ProductVariantRequest();
        request.setColor("Red");
        request.setPrice(BigDecimal.valueOf(149.99));
        request.setStockQty(20);
        request.setImageUrl("updated-image.jpg");

        Product product = new Product();
        product.setId(1L);
        product.setName("Test Product");

        ProductVariant updatedVariant = ProductVariant.builder()
                .id(variantId)
                .color("Red")
                .price(BigDecimal.valueOf(149.99))
                .stockQty(20)
                .imageUrl("updated-image.jpg")
                .product(product)
                .build();

        ProductVariantResponse response = ProductVariantResponse.builder()
                .id(variantId)
                .color("Red")
                .price(BigDecimal.valueOf(149.99))
                .stockQty(20)
                .imageUrl("updated-image.jpg")
                .productId(1L)
                .productName("Test Product")
                .build();

        when(variantService.updateVariant(eq(variantId), any(ProductVariantRequest.class))).thenReturn(updatedVariant);

        // Act
        ResponseEntity<ProductVariantResponse> result = variantController.updateVariant(variantId, request);

        // Assert
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(response.getId(), result.getBody().getId());
        assertEquals(response.getColor(), result.getBody().getColor());
        assertEquals(response.getPrice(), result.getBody().getPrice());
        verify(variantService, times(1)).updateVariant(eq(variantId), any(ProductVariantRequest.class));
    }
}