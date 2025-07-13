package com.vtnet.pdms.interfaces.api;

import com.vtnet.pdms.application.dto.auth.JwtAuthResponse;
import com.vtnet.pdms.application.dto.auth.LoginRequest;
import com.vtnet.pdms.application.dto.auth.TokenRefreshRequest;
import com.vtnet.pdms.application.service.AuthService;
import com.vtnet.pdms.infrastructure.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtAuthResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest refreshRequest) {
        return ResponseEntity.ok(authService.refreshToken(refreshRequest));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        authService.logout(userPrincipal.getId());
        return ResponseEntity.ok().build();
    }
} 