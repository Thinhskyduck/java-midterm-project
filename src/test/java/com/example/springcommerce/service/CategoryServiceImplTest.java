// src/test/java/com/example/springcommerce/service/CategoryServiceImplTest.java
package com.example.springcommerce.service;

import com.example.springcommerce.entity.Category;
import com.example.springcommerce.repository.CategoryRepository;
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
public class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepo;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @Test
    void getAll_ShouldReturnListOfCategories() {
        // Arrange
        Category category = Category.builder().name("Electronics").description("Tech products").build();
        List<Category> categories = Collections.singletonList(category);
        when(categoryRepo.findAll()).thenReturn(categories);

        // Act
        List<Category> result = categoryService.getAll();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Electronics", result.get(0).getName());
        verify(categoryRepo, times(1)).findAll();
    }

    @Test
    void create_ShouldReturnSavedCategory_WhenValid() {
        // Arrange
        Category category = Category.builder().name("Electronics").description("Tech products").build();
        when(categoryRepo.save(any(Category.class))).thenReturn(category);

        // Act
        Category result = categoryService.create(category);

        // Assert
        assertNotNull(result);
        assertEquals("Electronics", result.getName());
        assertEquals("Tech products", result.getDescription());
        verify(categoryRepo, times(1)).save(category);
    }

    @Test
    void update_ShouldUpdateAndReturnCategory_WhenValid() {
        // Arrange
        Long id = 1L;
        Category existingCategory = Category.builder().name("Old").description("Old desc").build();
        Category updatedCategory = Category.builder().name("New").description("New desc").build();
        when(categoryRepo.findById(id)).thenReturn(Optional.of(existingCategory));
        when(categoryRepo.save(any(Category.class))).thenReturn(updatedCategory);

        // Act
        Category result = categoryService.update(id, updatedCategory);

        // Assert
        assertEquals("New", result.getName());
        assertEquals("New desc", result.getDescription());
        verify(categoryRepo, times(1)).findById(id);
        verify(categoryRepo, times(1)).save(any(Category.class));
    }

    @Test
    void update_ShouldThrowException_WhenCategoryNotFound() {
        // Arrange
        Long id = 1L;
        Category category = Category.builder().name("New").description("New desc").build();
        when(categoryRepo.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> categoryService.update(id, category));
        verify(categoryRepo, times(1)).findById(id);
        verify(categoryRepo, never()).save(any(Category.class));
    }
}