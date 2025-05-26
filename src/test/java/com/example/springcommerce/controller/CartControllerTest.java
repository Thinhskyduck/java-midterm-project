// src/test/java/com/example/springcommerce/controller/CartControllerTest.java
package com.example.springcommerce.controller;

import com.example.springcommerce.dto.AddToCartReq;
import com.example.springcommerce.dto.CartItemResponse;
import com.example.springcommerce.dto.UpdateCartItemQuantityRequest;
import com.example.springcommerce.service.CartService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CartControllerTest {

    @Mock
    private CartService cartService;

    @InjectMocks
    private CartController cartController;

    @Test
    void getCartItems_ShouldReturnCartItems_WhenUserIdIsValid() {
        // Arrange
        Long userId = 1L;
        List<CartItemResponse> cartItems = Collections.singletonList(new CartItemResponse());
        when(cartService.getCartItems(userId)).thenReturn(cartItems);

        // Act
        ResponseEntity<List<CartItemResponse>> response = cartController.getCartItems(userId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(cartItems, response.getBody());
        verify(cartService, times(1)).getCartItems(userId);
    }

    @Test
    void addToCart_ShouldReturnCreatedStatus_WhenRequestIsValid() {
        // Arrange
        AddToCartReq request = new AddToCartReq();
        doNothing().when(cartService).addToCart(any(AddToCartReq.class));

        // Act
        ResponseEntity<Void> response = cartController.addToCart(request);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(cartService, times(1)).addToCart(request);
    }

    @Test
    void removeFromCart_ShouldReturnNoContent_WhenCartItemIdIsValid() {
        // Arrange
        Long cartItemId = 1L;
        doNothing().when(cartService).removeFromCart(cartItemId);

        // Act
        ResponseEntity<Void> response = cartController.removeFromCart(cartItemId);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(cartService, times(1)).removeFromCart(cartItemId);
    }
}