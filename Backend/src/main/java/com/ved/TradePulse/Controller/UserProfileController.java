package com.ved.TradePulse.Controller;

import com.ved.TradePulse.dtos.UserProfileDTO;
import com.ved.TradePulse.entity.User;
import com.ved.TradePulse.entity.UserProfile;
import com.ved.TradePulse.repository.UserProfileRepository;
import com.ved.TradePulse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
@CrossOrigin(origins = "http://localhost:5173")

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        UserProfile profile = userProfileRepository.findByUser(user).orElse(null);
        System.out.println(profile);
        UserProfileDTO dto = new UserProfileDTO();
        dto.setUsername(user.getUsername());
        if (profile != null) {
            dto.setAvatarUrl(profile.getAvatarUrl());
            dto.setWeight(profile.getWeight());
            dto.setHeight(profile.getHeight());
            dto.setGender(profile.getGender());
            dto.setAge(profile.getAge());
        }

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{userId}")
    public ResponseEntity<UserProfileDTO> updateUserProfile(
            @PathVariable Long userId,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "weight", required = false) Double weight,
            @RequestParam(value = "height", required = false) Double height,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "age", required = false) Integer age
    ) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        // Update username if provided
        if (username != null) {
            user.setUsername(username);
            userRepository.save(user);
        }

        UserProfile profile = userProfileRepository.findByUser(user).orElse(null);
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
        }

        // Handle avatar file upload
        if (avatar != null && !avatar.isEmpty()) {
            try {
                String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "avatars";
                File uploadPath = new File(uploadDir);
                if (!uploadPath.exists()) {
                    uploadPath.mkdirs();
                }

                // Delete old avatar file if it exists
                String oldAvatarUrl = profile.getAvatarUrl();
                if (oldAvatarUrl != null) {
                    File oldFile = new File(System.getProperty("user.dir") + oldAvatarUrl.replace("/", File.separator));
                    if (oldFile.exists()) oldFile.delete();
                }

                // Get file extension safely
                String originalFilename = avatar.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }

                // Generate unique filename with timestamp
                String filename = userId + "_avatar_" + System.currentTimeMillis() + extension;

                // Save new file
                File destination = new File(uploadPath, filename);
                avatar.transferTo(destination);

                // Save relative path
                profile.setAvatarUrl("/uploads/avatars/" + filename);
                user.setAvatarUrl("/uploads/avatars/" + filename);

            } catch (IOException e) {
                e.printStackTrace();
                //return ResponseEntity.status(500).body("Failed to save avatar image");
            }
        }

        // Update other profile fields
        if (weight != null) profile.setWeight(weight);
        if (height != null) profile.setHeight(height);
        if (gender != null) profile.setGender(gender);
        if (age != null) profile.setAge(age);

        userProfileRepository.save(profile);
        userRepository.save(user);
        UserProfileDTO dto = new UserProfileDTO();
        dto.setUsername(user.getUsername());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setWeight(profile.getWeight());
        dto.setHeight(profile.getHeight());
        dto.setGender(profile.getGender());
        dto.setAge(profile.getAge());


        return ResponseEntity.ok(dto);
    }


    // Helper method to get file extension from original filename
    private String getExtension(String filename) {
        if (filename == null) return "";
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? "" : filename.substring(dotIndex);
    }

}
