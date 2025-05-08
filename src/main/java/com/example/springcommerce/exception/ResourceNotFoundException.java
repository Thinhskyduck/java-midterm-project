// src/main/java/com/example/springcommerce/exception/ResourceNotFoundException.java
// (If not already present, or ensure it's suitable)
package com.example.springcommerce.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}