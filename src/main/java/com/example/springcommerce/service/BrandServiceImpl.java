package com.example.springcommerce.service;

import com.example.springcommerce.entity.Brand;
import com.example.springcommerce.repository.BrandRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepo;

    @Override
    public List<Brand> getAll() {
        return brandRepo.findAll();
    }

    @Override
    public Brand create(Brand brand) {
        return brandRepo.save(brand);
    }

    @Override
    public Brand update(Long id, Brand brand) {
        Brand existing = brandRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found"));
        existing.setName(brand.getName());
        return brandRepo.save(existing);
    }
}

