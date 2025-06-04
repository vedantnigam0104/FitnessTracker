package com.ved.TradePulse.repository;

import com.ved.TradePulse.entity.UserProfile;
import com.ved.TradePulse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUser(User user);
}