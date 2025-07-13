package com.vtnet.pdms.application.dto.auth;

import jakarta.validation.constraints.NotBlank;

public class TokenRefreshRequest {

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;

    // Getters and Setters
    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
} 