package com.vtnet.pdms.application.service;

import com.vtnet.pdms.application.dto.auth.JwtAuthResponse;
import com.vtnet.pdms.application.dto.auth.LoginRequest;
import com.vtnet.pdms.application.dto.auth.TokenRefreshRequest;
import com.vtnet.pdms.domain.repository.UserRepository;
import com.vtnet.pdms.infrastructure.security.JwtTokenProvider;
import com.vtnet.pdms.infrastructure.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    public JwtAuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String[] roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toArray(String[]::new);

        return new JwtAuthResponse(
                accessToken,
                refreshToken,
                userPrincipal.getId(),
                userPrincipal.getName(),
                userPrincipal.getEmail(),
                roles
        );
    }

    @Override
    public JwtAuthResponse refreshToken(TokenRefreshRequest refreshRequest) {
        String refreshToken = refreshRequest.getRefreshToken();
        
        if (!tokenProvider.validateToken(refreshToken) || !tokenProvider.isRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        
        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        
        // Load user details and create a new authentication
        UserPrincipal userPrincipal = userRepository.findById(userId)
                .map(user -> new UserPrincipal(user.getId(), user.getEmail(), user.getName()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // Generate new tokens
        String newAccessToken = tokenProvider.generateToken(authentication);
        String newRefreshToken = tokenProvider.generateRefreshToken(authentication);
        
        String[] roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toArray(String[]::new);

        return new JwtAuthResponse(
                newAccessToken,
                newRefreshToken,
                userPrincipal.getId(),
                userPrincipal.getName(),
                userPrincipal.getEmail(),
                roles
        );
    }

    @Override
    public void logout(Long userId) {
        // In a stateless JWT implementation, we don't need to do anything server-side
        // The client should discard the tokens
        // For additional security, we could implement a token blacklist
    }
} 