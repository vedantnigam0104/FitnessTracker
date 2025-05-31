package com.ved.TradePulse.config;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
public class DirectoryInitializer {

    private static final String AVATAR_UPLOAD_DIR = "uploads/avatars";

    @PostConstruct
    public void init() {
        File uploadDir = new File(AVATAR_UPLOAD_DIR);
        if (!uploadDir.exists()) {
            boolean created = uploadDir.mkdirs();
            if (created) {
                System.out.println("✅ Directory created: " + AVATAR_UPLOAD_DIR);
            } else {
                System.err.println("❌ Failed to create directory: " + AVATAR_UPLOAD_DIR);
            }
        } else {
            System.out.println("📂 Directory already exists: " + AVATAR_UPLOAD_DIR);
        }
    }
}

