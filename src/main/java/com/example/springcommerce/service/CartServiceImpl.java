// src/main/java/com/example/springcommerce/service/CartServiceImpl.java
package com.example.springcommerce.service;

import com.example.springcommerce.dto.AddToCartRequest;
import com.example.springcommerce.dto.CartItemResponse;
import com.example.springcommerce.dto.UpdateCartItemQuantityRequest; // Import new DTO
import com.example.springcommerce.entity.Cart;
import com.example.springcommerce.entity.CartItem;
import com.example.springcommerce.entity.ProductVariant;
import com.example.springcommerce.entity.User;
import com.example.springcommerce.exception.InsufficientStockException;
import com.example.springcommerce.exception.ResourceNotFoundException; // Or use EntityNotFoundException
import com.example.springcommerce.repository.CartItemRepository;
import com.example.springcommerce.repository.CartRepository;
import com.example.springcommerce.repository.ProductVariantRepository;
import com.example.springcommerce.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepo;
    private final CartItemRepository cartItemRepo;
    private final UserRepository userRepo;
    private final ProductVariantRepository variantRepo;

    private static final String CART_STATUS_ACTIVE = "ACTIVE";

    // ... (getCartItems, addToCart, removeFromCart, getOrCreateCart methods from before) ...
    @Override
    @Transactional(readOnly = true)
    public List<CartItemResponse> getCartItems(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return cartItemRepo.findByCartId(cart.getId()).stream().map(this::mapCartItemToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addToCart(AddToCartRequest request) {
        Long userId = request.getUserId();
        Long variantId = request.getVariantId();
        int quantityToAdd = request.getQuantity();

        if (quantityToAdd <= 0) {
            throw new IllegalArgumentException("Quantity to add must be positive.");
        }

        Cart cart = getOrCreateCart(userId);
        ProductVariant variant = variantRepo.findById(variantId)
                .orElseThrow(() -> new EntityNotFoundException("Product Variant not found with ID: " + variantId));

        Optional<CartItem> existingItemOpt = cartItemRepo.findByCartIdAndVariantId(cart.getId(), variantId);

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newTotalQuantity = existingItem.getQuantity() + quantityToAdd;
            if (variant.getStockQty() < newTotalQuantity) { // Check against total desired quantity in cart for this item
                throw new InsufficientStockException("Cannot increase quantity. Insufficient stock for " +
                        variant.getProduct().getName() + ". Requested total: " + newTotalQuantity +
                        ", Available: " + variant.getStockQty());
            }
            existingItem.setQuantity(newTotalQuantity);
            cartItemRepo.save(existingItem);
        } else {
            if (variant.getStockQty() < quantityToAdd) {
                throw new InsufficientStockException("Cannot add to cart. Insufficient stock for " +
                        variant.getProduct().getName() + ". Requested: " + quantityToAdd +
                        ", Available: " + variant.getStockQty());
            }
            CartItem newItem = CartItem.builder().cart(cart).variant(variant).quantity(quantityToAdd).build();
            cartItemRepo.save(newItem);
        }
    }

    @Override
    @Transactional
    public void removeFromCart(Long cartItemId) {
        if (!cartItemRepo.existsById(cartItemId)) {
            throw new EntityNotFoundException("CartItem not found with ID: " + cartItemId + " for removal.");
        }
        cartItemRepo.deleteById(cartItemId);
    }


    @Override
    @Transactional
    public CartItemResponse updateCartItemQuantity(Long cartItemId, UpdateCartItemQuantityRequest request) {
        Integer newQuantity = request.getNewQuantity();
        Long requestUserId = request.getUserId(); // User ID from the request

        CartItem cartItem = cartItemRepo.findById(cartItemId)
                .orElseThrow(() -> new EntityNotFoundException("CartItem not found with ID: " + cartItemId));

        // Authorization check: Ensure the cart item belongs to the user specified in the request
        // and that the cart is active. This will be more robust with Spring Security principals.
        Cart cart = cartItem.getCart();
        if (!cart.getUser().getId().equals(requestUserId)) {
            throw new SecurityException("User not authorized to update this cart item."); // Or a custom AccessDeniedException
        }
        if (!CART_STATUS_ACTIVE.equals(cart.getStatus())) {
            throw new IllegalStateException("Cannot update item quantity in a non-active cart.");
        }

        ProductVariant variant = cartItem.getVariant();

        // Stock Check: Ensure the new quantity doesn't exceed available stock
        if (variant.getStockQty() < newQuantity) {
            throw new InsufficientStockException(
                    "Cannot update quantity. Insufficient stock for " + variant.getProduct().getName() +
                            " (Color: " + variant.getColor() + "). Requested: " + newQuantity +
                            ", Available: " + variant.getStockQty()
            );
        }

        cartItem.setQuantity(newQuantity);
        CartItem updatedCartItem = cartItemRepo.save(cartItem);

        // Optional: Update cart's 'updatedAt' timestamp
        // cart.setUpdatedAt(LocalDateTime.now());
        // cartRepo.save(cart);

        return mapCartItemToResponse(updatedCartItem);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepo.findByUserIdAndStatus(userId, CART_STATUS_ACTIVE)
                .orElseGet(() -> {
                    User user = userRepo.findById(userId)
                            .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
                    return cartRepo.save(Cart.builder().user(user).status(CART_STATUS_ACTIVE).build());
                });
    }

    // Helper method to map CartItem to CartItemResponse
    private CartItemResponse mapCartItemToResponse(CartItem item) {
        ProductVariant variant = item.getVariant();
        String productName = (variant.getProduct() != null) ? variant.getProduct().getName() : "N/A";
        return CartItemResponse.builder()
                .cartItemId(item.getId())
                .productName(productName)
                .color(variant.getColor())
                .quantity(item.getQuantity())
                .unitPrice(variant.getPrice())
                .totalPrice(variant.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .imageUrl(variant.getImageUrl())
                .build();
    }
}