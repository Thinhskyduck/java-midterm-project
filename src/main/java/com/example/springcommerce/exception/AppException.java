// src/main/java/com/example/springcommerce/exception/AppException.java
package com.example.springcommerce.exception;

import org.springframework.http.HttpStatus;

public class AppException extends RuntimeException {
    private HttpStatus status;
    private String message;

    public AppException(HttpStatus status, String message) {
        super(message);
        this.status = status;
        this.message = message;
    }
    // Getters...
    public HttpStatus getStatus() { return status; }
    @Override public String getMessage() { return message; }
}