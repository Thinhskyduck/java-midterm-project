// src/main/java/com/example/springcommerce/controller/CartController.java
package com.example.springcommerce.controller;

import com.example.springcommerce.dto.AddToCartReq;
import com.example.springcommerce.dto.CartItemResponse;
import com.example.springcommerce.dto.UpdateCartItemQuantityRequest; // New DTO
import com.example.springcommerce.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    @Autowired
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // GET /api/cart?userId=1
    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCartItems(@RequestParam Long userId) {
        // TODO: With security, userId should come from authenticated principal
        List<CartItemResponse> cartItems = cartService.getCartItems(userId);
        return ResponseEntity.ok(cartItems);
    }

    // POST /api/cart/add
    @PostMapping("/add")
    public ResponseEntity<Void> addToCart(@Valid @RequestBody AddToCartReq request) {
        cartService.addToCart(request);
        return ResponseEntity.status(HttpStatus.CREATED).build(); // Or return the updated cart
    }

    // DELETE /api/cart/remove/{cartItemId}
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long cartItemId) {
        // TODO: Add check to ensure authenticated user owns this cart item
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/cart/items/{cartItemId}/quantity
    @PutMapping("/items/{cartItemId}/quantity")
    public ResponseEntity<CartItemResponse> updateCartItemQuantity(
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemQuantityRequest request) {
        // TODO: With security, ensure the userId in the request matches the authenticated principal,
        // or derive userId from principal and remove from DTO if preferred.
        CartItemResponse updatedItem = cartService.updateCartItemQuantity(cartItemId, request);
        return ResponseEntity.ok(updatedItem);
    }
}