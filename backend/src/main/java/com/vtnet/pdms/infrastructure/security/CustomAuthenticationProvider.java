package com.vtnet.pdms.infrastructure.security;

import com.vtnet.pdms.domain.model.Role;
import com.vtnet.pdms.domain.model.User;
import com.vtnet.pdms.domain.repository.UserRepository;
import com.vtnet.pdms.infrastructure.logging.AuditLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Custom authentication provider that authenticates against our user database.
 */
@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogger auditLogger;

    /**
     * Constructor with dependency injection.
     *
     * @param userRepository Repository for user operations
     * @param passwordEncoder Password encoder for password verification
     * @param auditLogger    Logger for audit events
     */
    @Autowired
    public CustomAuthenticationProvider(UserRepository userRepository, 
                                       PasswordEncoder passwordEncoder,
                                       AuditLogger auditLogger) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogger = auditLogger;
    }

    /**
     * Authenticates the user with the provided credentials.
     *
     * @param authentication The authentication request
     * @return Authenticated token if successful
     * @throws AuthenticationException if authentication fails
     */
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String email = authentication.getName();
        String password = authentication.getCredentials().toString();
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isEmpty()) {
            auditLogger.logLoginAttempt(email, false, getClientIp());
            throw new BadCredentialsException("Invalid email or password");
        }
        
        User user = userOptional.get();
        
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            auditLogger.logLoginAttempt(email, false, getClientIp());
            throw new BadCredentialsException("Invalid email or password");
        }
        
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(Role::getName)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
        
        UserPrincipal principal = new UserPrincipal(user.getId(), user.getEmail(), user.getName());
        
        auditLogger.logLoginAttempt(email, true, getClientIp());
        
        return new UsernamePasswordAuthenticationToken(principal, null, authorities);
    }

    /**
     * Returns whether this provider supports the given authentication type.
     *
     * @param authentication The authentication class to check
     * @return true if this provider supports the authentication class
     */
    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
    
    /**
     * Gets the client IP address.
     * This is a placeholder implementation and should be replaced with actual client IP retrieval.
     *
     * @return The client IP address
     */
    private String getClientIp() {
        // In a real implementation, this would get the client IP from the request
        return "0.0.0.0";
    }
} 