// src/main/java/com/example/springcommerce/config/SecurityConfig.java
package com.example.springcommerce.config;

import com.example.springcommerce.service.UserDetailsServiceImpl; // Your UserDetailsService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // To enable method-level security like @PreAuthorize
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService; // Your custom UserDetailsService

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter; // Your JWT filter

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for stateless APIs
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Stateless sessions
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // Allow auth endpoints
                        .requestMatchers("/api/products/**").permitAll() // Allow product browsing
                        .requestMatchers("/api/categories/**").permitAll() // Allow category browsing
                        .requestMatchers("/api/brands/**").permitAll()     // Allow brand browsing
                        .requestMatchers(
                                "/swagger-ui/**",          // For Swagger UI HTML, CSS, JS files
                                "/v3/api-docs/**",         // For the OpenAPI spec (JSON or YAML)
                                "/swagger-resources/**",   // Sometimes needed for Swagger resources
                                "/webjars/**"              // For Swagger UI webjar dependencies
                        ).permitAll() // If using Swagger/OpenAPI
                        .anyRequest().authenticated() // All other requests require authentication
                );

        // Add JWT token filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}