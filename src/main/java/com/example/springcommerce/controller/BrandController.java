package com.example.springcommerce.controller;

import com.example.springcommerce.dto.BrandRequest;
import com.example.springcommerce.entity.Brand;
import com.example.springcommerce.service.BrandService;
import lombok.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    public List<Brand> getAll() {
        return brandService.getAll();
    }

    @PostMapping
    public Brand create(@RequestBody BrandRequest request) {
        return brandService.create(Brand.builder().name(request.getName()).build());
    }

    @PutMapping("/{id}")
    public Brand update(@PathVariable Long id, @RequestBody BrandRequest request) {
        return brandService.update(id, Brand.builder().name(request.getName()).build());
    }
}

