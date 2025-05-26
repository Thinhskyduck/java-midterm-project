// src/test/java/com/example/springcommerce/controller/CategoryControllerTest.java
package com.example.springcommerce.controller;

import com.example.springcommerce.dto.CategoryRequest;
import com.example.springcommerce.entity.Category;
import com.example.springcommerce.service.CategoryService;
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
public class CategoryControllerTest {

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    @Test
    void getAll_ShouldReturnListOfCategories() {
        // Arrange
        List<Category> categories = Collections.singletonList(new Category());
        when(categoryService.getAll()).thenReturn(categories);

        // Act
        List<Category> result = categoryController.getAll();

        // Assert
        assertEquals(categories, result);
        verify(categoryService, times(1)).getAll();
    }

    @Test
    void create_ShouldReturnCreatedCategory_WhenRequestIsValid() {
        // Arrange
        CategoryRequest request = new CategoryRequest();
        request.setName("Electronics");
        request.setDescription("Electronic products");
        Category category = Category.builder()
                .name("Electronics")
                .description("Electronic products")
                .build();
        when(categoryService.create(any(Category.class))).thenReturn(category);

        // Act
        Category result = categoryController.create(request);

        // Assert
        assertEquals(category, result);
        verify(categoryService, times(1)).create(any(Category.class));
    }

    @Test
    void update_ShouldReturnUpdatedCategory_WhenRequestIsValid() {
        // Arrange
        Long id = 1L;
        CategoryRequest request = new CategoryRequest();
        request.setName("Updated Electronics");
        request.setDescription("Updated description");
        Category updatedCategory = Category.builder()
                .name("Updated Electronics")
                .description("Updated description")
                .build();
        when(categoryService.update(eq(id), any(Category.class))).thenReturn(updatedCategory);

        // Act
        Category result = categoryController.update(id, request);

        // Assert
        assertEquals(updatedCategory, result);
        verify(categoryService, times(1)).update(eq(id), any(Category.class));
    }
}