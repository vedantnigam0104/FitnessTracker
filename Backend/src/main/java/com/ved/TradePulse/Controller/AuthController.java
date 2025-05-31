package com.ved.TradePulse.Controller;
import com.ved.TradePulse.dtos.AuthRequest;
import com.ved.TradePulse.dtos.AuthResponse;
import com.ved.TradePulse.dtos.GoogleLoginRequest;
import com.ved.TradePulse.services.JwtService;
import com.ved.TradePulse.services.UserService;
import lombok.RequiredArgsConstructor;
import com.ved.TradePulse.entity.User;
import com.ved.TradePulse.domain.USER_ROLE;
import com.ved.TradePulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "role", required = false) USER_ROLE role,
            @RequestParam(value = "avatar", required = false) MultipartFile avatarFile
    ) {
        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body("Username is already taken");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already in use");
        }

        String avatarUrl = null;
        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "avatars";
                File uploadFolder = new File(uploadDir);
                if (!uploadFolder.exists()) {
                    uploadFolder.mkdirs();
                }

                // Generate a unique filename with original extension
                String originalFilename = avatarFile.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String fileName = System.currentTimeMillis() + "_avatar" + extension;

                Path filePath = Paths.get(uploadDir, fileName);
                Files.write(filePath, avatarFile.getBytes());

                avatarUrl = "/uploads/avatars/" + fileName;

            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("Failed to save avatar image");
            }
        }

        User newUser = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .role(role != null ? role : USER_ROLE.CUSTOMER) // use role if provided else default
                .createdAt(LocalDateTime.now())
                .avatarUrl(avatarUrl)
                .build();

        userRepository.save(newUser);
        return ResponseEntity.ok("User registered successfully");
    }




    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtService.generateToken(authentication);

        // Fetch user details by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Return token and avatarUrl in AuthResponse
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getLoggedInUser(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        return userOpt.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping("/google-login")
    public ResponseEntity<AuthResponse> loginWithGoogle(@RequestBody GoogleLoginRequest googleUser) {
        // First try to find by email (which is unique in your schema)
        Optional<User> existingUserOpt = userRepository.findByEmail(googleUser.getEmail());

        User user;

        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get(); // Existing user
        } else {
            // Generate a unique username if the provided one exists
            String uniqueUsername = generateUniqueUsername(googleUser.getUsername());

            // Register new Google user
            user = User.builder()
                    .email(googleUser.getEmail())
                    .username(uniqueUsername) // Use the unique username
                    .fullName(googleUser.getUsername()) // Can be non-unique
                    .avatarUrl(googleUser.getAvatarUrl())
                    .password(passwordEncoder.encode("google_default"))
                    .role(USER_ROLE.CUSTOMER)
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(user);
        }

        // Authenticate via email (Principal will use email)
        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), null, null);
        String token = jwtService.generateToken(authentication);

        return ResponseEntity.ok(new AuthResponse(token));
    }
    private String generateUniqueUsername(String baseUsername) {
        String username = baseUsername;
        int counter = 1;

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }
}
