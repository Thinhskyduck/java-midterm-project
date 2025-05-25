// src/main/java/com/example/springcommerce/service/UserServiceImpl.java
package com.example.springcommerce.service;

import com.example.springcommerce.dto.UserDto;
import com.example.springcommerce.entity.User;
import com.example.springcommerce.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
        return mapToUserDto(user);
    }

    @Override
    @Transactional // Cần @Transactional vì có thao tác ghi
    public void updateUserAddress(String username, String newAddress) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
        user.setAddress(newAddress);
        userRepository.save(user);
        // Không cần trả về gì vì controller sẽ trả về message
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .address(user.getAddress())
                .build();
    }
}