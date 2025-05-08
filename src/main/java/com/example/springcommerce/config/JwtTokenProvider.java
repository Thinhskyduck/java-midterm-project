// src/main/java/com/example/springcommerce/config/JwtTokenProvider.java
package com.example.springcommerce.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey; // Keep this
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey jwtSecretKey;
    private final long jwtExpirationMs;
    private final JwtParser jwtParser; // Store the configured parser

    public JwtTokenProvider(@Value("${jwt.secret}") String jwtSecret,
                            @Value("${jwt.expirationMs}") long jwtExpirationMs) {
        // Ensure the secret key is strong enough for HS512
        // (at least 64 bytes, which is 512 bits)
        // If your key from properties is shorter, Keys.hmacShaKeyFor might throw an error
        // or generate a less secure key if not handled properly.
        // For simplicity here, assuming jwtSecret.getBytes() is sufficient,
        // but for production, ensure key strength.
        this.jwtSecretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        this.jwtExpirationMs = jwtExpirationMs;
        // Initialize the parser once
        this.jwtParser = Jwts.parser().verifyWith(this.jwtSecretKey).build();
    }

    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        String roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .subject(userPrincipal.getUsername()) // Use .subject() for username
                .claim("roles", roles)
                .issuedAt(now) // Use 'now' directly
                .expiration(expiryDate) // Use .expiration()
                .signWith(jwtSecretKey, Jwts.SIG.HS512) // Use Jwts.SIG for algorithm constants
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = jwtParser.parseSignedClaims(token).getPayload(); // Use .getPayload()
        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            jwtParser.parseSignedClaims(authToken); // Use the pre-configured parser
            return true;
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty or invalid: {}", ex.getMessage());
        } catch (io.jsonwebtoken.security.SignatureException ex) { // Keep this specific catch
            logger.error("JWT signature validation failed: {}", ex.getMessage());
        }
        return false;
    }

    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}