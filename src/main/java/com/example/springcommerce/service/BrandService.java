package com.example.springcommerce.service;

import com.example.springcommerce.entity.Brand;

import java.util.List;

public interface BrandService {
    List<Brand> getAll();
    Brand create(Brand brand);
    Brand update(Long id, Brand brand);
}

