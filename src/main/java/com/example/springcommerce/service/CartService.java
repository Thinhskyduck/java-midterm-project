package com.example.springcommerce.service;

import com.example.springcommerce.dto.AddToCartRequest;
import com.example.springcommerce.dto.CartItemResponse;
import com.example.springcommerce.dto.UpdateCartItemQuantityRequest;

import java.util.List;

public interface CartService {
    List<CartItemResponse> getCartItems(Long userId);
    void addToCart(AddToCartRequest request);
    void removeFromCart(Long cartItemId);
    CartItemResponse updateCartItemQuantity(Long cartItemId, UpdateCartItemQuantityRequest request);
}

