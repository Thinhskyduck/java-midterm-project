// src/main/java/com/example/springcommerce/config/SecurityConfig.java
package com.example.springcommerce.config;

import com.example.springcommerce.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod; // <<< THÊM IMPORT NÀY
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher; // <<< THÊM IMPORT NÀY
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults()) // <<< THỬ THÊM CẤU HÌNH CORS RÕ RÀNG HƠN
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public static resources and main HTML pages
                        .requestMatchers(
                                new AntPathRequestMatcher("/"), // Trang chủ
                                new AntPathRequestMatcher("/index.html"),
                                new AntPathRequestMatcher("/shop-grid.html"),
                                new AntPathRequestMatcher("/shop-details.html"),
                                new AntPathRequestMatcher("/shoping-cart.html"),
                                new AntPathRequestMatcher("/checkout.html"),
                                new AntPathRequestMatcher("/order-confirmation.html"),
                                new AntPathRequestMatcher("/login.html"),
                                new AntPathRequestMatcher("/my-orders.html"),
                                new AntPathRequestMatcher("/profile.html"),
                                new AntPathRequestMatcher("/register.html"),
                                new AntPathRequestMatcher("/forgot-password.html"),
                                new AntPathRequestMatcher("/auth/reset-password-page/**"),
                                // Thư mục tĩnh chung
                                new AntPathRequestMatcher("/css/**"),
                                new AntPathRequestMatcher("/js/**"), // Bao gồm /js/admin/**
                                new AntPathRequestMatcher("/img/**"),
                                new AntPathRequestMatcher("/fonts/**"),
                                new AntPathRequestMatcher("/sass/**"),
                                new AntPathRequestMatcher("/favicon.ico"),
                                new AntPathRequestMatcher("/admin/**.html"),
                                new AntPathRequestMatcher("/admin/vendors/**"),
                                new AntPathRequestMatcher("/admin/src/**")
                        ).permitAll()
                        // Swagger UI and API docs
                        .requestMatchers(
                                new AntPathRequestMatcher("/swagger-ui/**"),
                                new AntPathRequestMatcher("/v3/api-docs/**"),
                                new AntPathRequestMatcher("/swagger-ui.html"),
                                new AntPathRequestMatcher("/swagger-resources/**"),
                                new AntPathRequestMatcher("/webjars/**")
                        ).permitAll()
                        // API AUTH
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/**")).permitAll()
                        // PUBLIC APIs (Explicitly state HttpMethod.GET for public read APIs)
                        .requestMatchers(new AntPathRequestMatcher("/api/products", HttpMethod.GET.toString())).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/products/*", HttpMethod.GET.toString())).permitAll() // Cho GET /api/products/{id}
                        .requestMatchers(new AntPathRequestMatcher("/api/categories", HttpMethod.GET.toString())).permitAll() // <<< CHO PHÉP GET CATEGORIES
                        .requestMatchers(new AntPathRequestMatcher("/api/categories/*", HttpMethod.GET.toString())).permitAll() // Cho GET /api/categories/{id} (nếu có)
                        .requestMatchers(new AntPathRequestMatcher("/api/brands", HttpMethod.GET.toString())).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/brands/*", HttpMethod.GET.toString())).permitAll() // Cho GET /api/brands/{id} (nếu có)
                        .requestMatchers("/api/cart/**").authenticated()
                        .requestMatchers("/api/orders/**").authenticated()
                        .requestMatchers("/api/users/me/**").authenticated() // << THÊM DÒNG NÀY
                        // Các API CRUD khác cho product/category/brand (POST, PUT, DELETE) YÊU CẦU XÁC THỰC (ví dụ: ADMIN)
                        // Ví dụ:
                        // .requestMatchers(new AntPathRequestMatcher("/api/products", HttpMethod.POST.toString())).hasRole("ADMIN")
                        // .requestMatchers(new AntPathRequestMatcher("/api/categories", HttpMethod.POST.toString())).hasRole("ADMIN")
                        .requestMatchers("/admin/**").hasRole("ADMIN") // Bảo vệ tất cả các trang trong /admin/
                        .requestMatchers(HttpMethod.POST, "/api/products").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        // Thêm các API khác cho admin nếu có (ví dụ: quản lý user, order status)
                        .requestMatchers(new AntPathRequestMatcher("/api/admin/users/**")).hasRole("ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/admin/orders/**")).hasRole("ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/orders/all")).hasRole("ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/variants/**")).hasRole("ADMIN") // << CHO PHÉP TẤT CẢ METHOD cho /api/variants cho ADMIN
                        .anyRequest().authenticated() // Tất cả các request khác yêu cầu xác thực
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}