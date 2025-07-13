package com.vtnet.pdms.application.service;

import com.vtnet.pdms.application.dto.auth.JwtAuthResponse;
import com.vtnet.pdms.application.dto.auth.LoginRequest;
import com.vtnet.pdms.application.dto.auth.TokenRefreshRequest;

public interface AuthService {

    /**
     * Authenticate a user with email and password.
     *
     * @param loginRequest The login request containing email and password
     * @return JWT authentication response with tokens and user details
     */
    JwtAuthResponse login(LoginRequest loginRequest);

    /**
     * Refresh an authentication token using a refresh token.
     *
     * @param refreshRequest The refresh token request
     * @return JWT authentication response with new tokens
     */
    JwtAuthResponse refreshToken(TokenRefreshRequest refreshRequest);

    /**
     * Logout a user by invalidating their tokens.
     *
     * @param userId The user ID
     */
    void logout(Long userId);
} 