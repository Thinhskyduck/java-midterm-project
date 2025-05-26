// src/test/java/com/example/springcommerce/controller/BrandControllerTest.java
package com.example.springcommerce.controller;

import com.example.springcommerce.dto.BrandRequest;
import com.example.springcommerce.entity.Brand;
import com.example.springcommerce.service.BrandService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BrandControllerTest {

    @Mock
    private BrandService brandService;

    @InjectMocks
    private BrandController brandController;

    @Test
    void getAll_ShouldReturnListOfBrands() {
        // Arrange
        List<Brand> brands = Collections.singletonList(Brand.builder().name("Brand1").build());
        when(brandService.getAll()).thenReturn(brands);

        // Act
        List<Brand> result = brandController.getAll();

        // Assert
        assertEquals(brands, result);
        verify(brandService, times(1)).getAll();
    }

    @Test
    void create_ShouldReturnCreatedBrand_WhenRequestIsValid() {
        // Arrange
        BrandRequest request = new BrandRequest();
        request.setName("NewBrand");
        Brand brand = Brand.builder().name("NewBrand").build();
        when(brandService.create(any(Brand.class))).thenReturn(brand);

        // Act
        Brand result = brandController.create(request);

        // Assert
        assertEquals(brand, result);
        verify(brandService, times(1)).create(any(Brand.class));
    }

    @Test
    void update_ShouldReturnUpdatedBrand_WhenRequestIsValid() {
        // Arrange
        Long id = 1L;
        BrandRequest request = new BrandRequest();
        request.setName("UpdatedBrand");
        Brand updatedBrand = Brand.builder().name("UpdatedBrand").build();
        when(brandService.update(eq(id), any(Brand.class))).thenReturn(updatedBrand);

        // Act
        Brand result = brandController.update(id, request);

        // Assert
        assertEquals(updatedBrand, result);
        verify(brandService, times(1)).update(eq(id), any(Brand.class));
    }
}