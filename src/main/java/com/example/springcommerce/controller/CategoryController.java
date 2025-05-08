package com.example.springcommerce.controller;

import com.example.springcommerce.dto.CategoryRequest;
import com.example.springcommerce.entity.Category;
import com.example.springcommerce.service.CategoryService;
import lombok.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public List<Category> getAll() {
        return categoryService.getAll();
    }

    @PostMapping
    public Category create(@RequestBody CategoryRequest request) {
        return categoryService.create(Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build());
    }

    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @RequestBody CategoryRequest request) {
        return categoryService.update(id, Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build());
    }
}

