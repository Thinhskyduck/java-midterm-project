// src/main/java/com/example/springcommerce/service/UserServiceImpl.java
package com.example.springcommerce.service;

import com.example.springcommerce.dto.AdminUpdateUserRequest;
import com.example.springcommerce.dto.UserDto;
import com.example.springcommerce.entity.User;
import com.example.springcommerce.exception.AppException; // Giả sử bạn có AppException
import com.example.springcommerce.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus; // Cho AppException
import org.springframework.security.crypto.password.PasswordEncoder; // Có thể cần nếu sau này có reset pass
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

//    private UserDto mapToUserDto(User user) {
//        return UserDto.builder()
//                .id(user.getId())
//                .username(user.getUsername())
//                .fullName(user.getFullName())
//                .email(user.getEmail())
//                .address(user.getAddress())
//                .build();
//    }

    // --- ADMIN METHODS ---

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(Pageable pageable) {
        Page<User> usersPage = userRepository.findAll(pageable);
        return usersPage.map(this::mapToUserDto); // Sử dụng map của Page để chuyển đổi
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserByIdByAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        return mapToUserDto(user);
    }

    @Override
    @Transactional
    public UserDto updateUserByAdmin(Long userId, AdminUpdateUserRequest updateUserRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        // Kiểm tra email duy nhất (nếu email bị thay đổi và khác email cũ của user này)
        if (!user.getEmail().equalsIgnoreCase(updateUserRequest.getEmail()) &&
                userRepository.existsByEmail(updateUserRequest.getEmail().toLowerCase())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email address is already in use by another account.");
        }

        user.setFullName(updateUserRequest.getFullName());
        user.setEmail(updateUserRequest.getEmail().toLowerCase()); // Lưu email chữ thường
        user.setAddress(updateUserRequest.getAddress());
        user.setRole(updateUserRequest.getRole());
        // Không cho phép admin thay đổi username
        // Không cho phép admin thay đổi password trực tiếp ở đây (nên có quy trình reset riêng)

        User updatedUser = userRepository.save(user);
        return mapToUserDto(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUserByAdmin(Long userId) {
        // Kiểm tra xem user có tồn tại không trước khi xóa
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found with ID: " + userId + " for deletion.");
        }
        // Cân nhắc việc không cho xóa tài khoản admin cuối cùng hoặc tài khoản đang đăng nhập
        // User currentUser = ... (lấy user đang thực hiện hành động) ...
        // if (currentUser.getId().equals(userId)) {
        //     throw new AppException(HttpStatus.BAD_REQUEST, "Admin cannot delete their own account.");
        // }
        userRepository.deleteById(userId);
        // Cân nhắc xóa mềm: thêm trường 'deleted' hoặc 'active' vào User entity
        // User user = userRepository.findById(userId).orElseThrow(...);
        // user.setActive(false); // or user.setDeleted(true);
        // userRepository.save(user);
    }


    // Helper map Entity sang DTO (đã có)
    // Trong UserServiceImpl
    private UserDto mapToUserDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .address(user.getAddress())
                .role(user.getRole()) // << MAP ROLE
                .build();
    }
}