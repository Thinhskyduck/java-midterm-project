package com.example.springcommerce.repository;

import com.example.springcommerce.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartId(Long cartId);
    Optional<CartItem> findByCartIdAndVariantId(Long cartId, Long variantId);
    void deleteByCartId(Long cartId);
}
