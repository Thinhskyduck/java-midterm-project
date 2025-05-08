package com.example.springcommerce.service;

import com.example.springcommerce.entity.Category;

import java.util.List;

public interface CategoryService {
    List<Category> getAll();
    Category create(Category category);
    Category update(Long id, Category category);
}

