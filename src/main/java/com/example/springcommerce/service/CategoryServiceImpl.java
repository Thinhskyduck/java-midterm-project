package com.example.springcommerce.service;

import com.example.springcommerce.entity.Category;
import com.example.springcommerce.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepo;

    @Override
    public List<Category> getAll() {
        return categoryRepo.findAll();
    }

    @Override
    public Category create(Category category) {
        return categoryRepo.save(category);
    }

    @Override
    public Category update(Long id, Category category) {
        Category existing = categoryRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        return categoryRepo.save(existing);
    }
}

