// src/test/java/com/example/springcommerce/service/BrandServiceImplTest.java
package com.example.springcommerce.service;

import com.example.springcommerce.entity.Brand;
import com.example.springcommerce.repository.BrandRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BrandServiceImplTest {

    @Mock
    private BrandRepository brandRepo;

    @InjectMocks
    private BrandServiceImpl brandService;

    @Test
    void getAll_ShouldReturnListOfBrands() {
        // Arrange
        Brand brand = Brand.builder().name("Brand1").build();
        List<Brand> brands = Collections.singletonList(brand);
        when(brandRepo.findAll()).thenReturn(brands);

        // Act
        List<Brand> result = brandService.getAll();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Brand1", result.get(0).getName());
        verify(brandRepo, times(1)).findAll();
    }

    @Test
    void create_ShouldReturnSavedBrand_WhenValid() {
        // Arrange
        Brand brand = Brand.builder().name("Brand1").build();
        when(brandRepo.save(any(Brand.class))).thenReturn(brand);

        // Act
        Brand result = brandService.create(brand);

        // Assert
        assertNotNull(result);
        assertEquals("Brand1", result.getName());
        verify(brandRepo, times(1)).save(brand);
    }

    @Test
    void update_ShouldUpdateAndReturnBrand_WhenValid() {
        // Arrange
        Long id = 1L;
        Brand existingBrand = Brand.builder().name("OldBrand").build();
        Brand updatedBrand = Brand.builder().name("NewBrand").build();
        when(brandRepo.findById(id)).thenReturn(Optional.of(existingBrand));
        when(brandRepo.save(any(Brand.class))).thenReturn(updatedBrand);

        // Act
        Brand result = brandService.update(id, updatedBrand);

        // Assert
        assertEquals("NewBrand", result.getName());
        verify(brandRepo, times(1)).findById(id);
        verify(brandRepo, times(1)).save(any(Brand.class));
    }

    @Test
    void update_ShouldThrowException_WhenBrandNotFound() {
        // Arrange
        Long id = 1L;
        Brand brand = Brand.builder().name("NewBrand").build();
        when(brandRepo.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> brandService.update(id, brand));
        verify(brandRepo, times(1)).findById(id);
        verify(brandRepo, never()).save(any(Brand.class));
    }
}