package com.example.springcommerce.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {
    private String name;
    private String description;
}

