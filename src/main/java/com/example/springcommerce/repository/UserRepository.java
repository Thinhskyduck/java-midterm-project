package com.example.springcommerce.repository;

import com.example.springcommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);
    Optional<User> findByEmail(String email); // Cần cho forgot password
}


