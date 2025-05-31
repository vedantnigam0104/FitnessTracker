package com.ved.TradePulse.services;

import com.ved.TradePulse.dtos.AuthRequest;
import com.ved.TradePulse.entity.User;
import com.ved.TradePulse.repository.UserRepository;
import com.ved.TradePulse.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public boolean registerUser(User user1) {
        if (userRepository.findByEmail(user1.getEmail()).isPresent()) {
            return false; // Email already exists
        }
        user1.setPassword(passwordEncoder.encode(user1.getPassword()));
        userRepository.save(user1);
        return true;
    }

    public String loginUser(AuthRequest authRequest) {
        // Find user by email using Optional
        User user = userRepository.findByEmail(authRequest.getEmail())
                .orElse(null);

        // Validate user existence and password match
        if (user == null || !passwordEncoder.matches(authRequest.getPassword(), user.getPassword())) {
            return null; // Invalid credentials
        }

        // Convert User entity to UserDetails (Spring Security)
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new ArrayList<>()  // Add roles/authorities if needed
        );

        // Generate JWT token using UserDetails
        return jwtUtil.generateToken(userDetails);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Convert User entity to UserDetails (Spring Security)
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new ArrayList<>()  // Add roles/authorities if needed
        );
    }
}


