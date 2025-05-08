// src/main/java/com/example/springcommerce/service/OrderServiceImpl.java
package com.example.springcommerce.service;

import com.example.springcommerce.dto.OrderItemResponse;
import com.example.springcommerce.dto.OrderResponse;
import com.example.springcommerce.entity.*;
import com.example.springcommerce.exception.EmptyCartException;
import com.example.springcommerce.exception.InsufficientStockException;
import com.example.springcommerce.exception.ResourceNotFoundException;
import com.example.springcommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;

    private static final String CART_STATUS_ACTIVE = "ACTIVE";
    private static final String CART_STATUS_CHECKED_OUT = "CHECKED_OUT";
    private static final String ORDER_STATUS_PENDING = "PENDING";
    // Add other valid order statuses if needed for validation
    private static final List<String> VALID_ORDER_STATUSES = List.of(
            ORDER_STATUS_PENDING, "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"
    );


    @Autowired
    public OrderServiceImpl(UserRepository userRepository,
                            CartRepository cartRepository,
                            ProductVariantRepository productVariantRepository,
                            OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.productVariantRepository = productVariantRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional
    public OrderResponse checkout(Long userId, String shippingAddressInput) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUserIdAndStatus(userId, CART_STATUS_ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Active cart not found for user ID: " + userId));

        List<CartItem> cartItems = cart.getItems();
        if (cartItems == null || cartItems.isEmpty()) {
            throw new EmptyCartException("Cannot checkout an empty cart for user: " + user.getUsername());
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(ORDER_STATUS_PENDING);

        String finalShippingAddress;
        if (StringUtils.hasText(shippingAddressInput)) {
            finalShippingAddress = shippingAddressInput;
        } else if (StringUtils.hasText(user.getAddress())) {
            finalShippingAddress = user.getAddress();
        } else {
            throw new IllegalArgumentException("Shipping address is required and no default address found for user.");
        }
        order.setShippingAddress(finalShippingAddress);

        List<OrderItem> orderItemsList = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            ProductVariant variant = cartItem.getVariant();
            if (variant.getStockQty() < cartItem.getQuantity()) {
                throw new InsufficientStockException("Quantity is out of stock");
            }
            variant.setStockQty(variant.getStockQty() - cartItem.getQuantity());
            productVariantRepository.save(variant);

            OrderItem orderItem = new OrderItem();
            orderItem.setVariant(variant);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(variant.getPrice());
            orderItem.setOrder(order);
            orderItemsList.add(orderItem);
            totalAmount = totalAmount.add(variant.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }
        order.setOrderItems(orderItemsList);
        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        cart.setStatus(CART_STATUS_CHECKED_OUT);
        cartRepository.save(cart);
        return mapOrderToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        // TODO: Add security check: ensure the authenticated user owns this order or is an admin
        return mapOrderToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId); // Assuming method in OrderRepository
        return orders.stream()
                .map(this::mapOrderToOrderResponse)
                .collect(Collectors.toList());
    }

    // If using Pageable:
    /*
    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByUserId(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        Page<Order> ordersPage = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable); // Assuming method in OrderRepository
        return ordersPage.map(this::mapOrderToOrderResponse);
    }
    */

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String newStatus) {
        // Basic validation for status string
        if (!StringUtils.hasText(newStatus) || !VALID_ORDER_STATUSES.contains(newStatus.toUpperCase())) {
            throw new IllegalArgumentException("Invalid order status provided: " + newStatus +
                    ". Valid statuses are: " + VALID_ORDER_STATUSES);
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // TODO: Add security check: ensure only admin can update status (or specific transitions for users)

        // Business logic for status transitions (optional, but good practice)
        // e.g., cannot change from DELIVERED back to PENDING
        // if (order.getStatus().equals("DELIVERED") && !newStatus.equalsIgnoreCase("DELIVERED")) {
        //     throw new IllegalStateException("Cannot change status of a delivered order.");
        // }

        // If status is changing to CANCELLED, consider reverting stock quantities
        if ("CANCELLED".equalsIgnoreCase(newStatus) && !order.getStatus().equalsIgnoreCase("CANCELLED")) {
            // Revert stock for each order item
            for (OrderItem item : order.getOrderItems()) {
                ProductVariant variant = item.getVariant();
                variant.setStockQty(variant.getStockQty() + item.getQuantity());
                productVariantRepository.save(variant);
            }
        }

        order.setStatus(newStatus.toUpperCase());
        Order updatedOrder = orderRepository.save(order);
        return mapOrderToOrderResponse(updatedOrder);
    }


    private OrderResponse mapOrderToOrderResponse(Order order) {
        // Ensure lazy-loaded collections are accessible if not already fetched
        // (being within @Transactional helps here)
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(oi -> OrderItemResponse.builder()
                        .id(oi.getId()) // OrderItem ID
                        .productVariantId(oi.getVariant().getId())
                        .productName(oi.getVariant().getProduct().getName())
                        .productVariantColor(oi.getVariant().getColor())
                        .quantity(oi.getQuantity())
                        .unitPrice(oi.getUnitPrice())
                        .subtotal(oi.getUnitPrice().multiply(BigDecimal.valueOf(oi.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .username(order.getUser().getUsername())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemResponses)
                .build();
    }
}