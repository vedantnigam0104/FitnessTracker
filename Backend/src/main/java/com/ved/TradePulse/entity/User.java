package com.ved.TradePulse.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ved.TradePulse.domain.USER_ROLE;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private USER_ROLE role = USER_ROLE.CUSTOMER;

    @Embedded
    private TwoFactorAuth twoFactorAuth = new TwoFactorAuth();

    // Add this new field for avatar image path or URL
    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    // Optional: getter and setter (if not using Lombok @Data)
    // public String getAvatarUrl() { return avatarUrl; }
    // public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}

