package com.ved.TradePulse.repository;

import com.ved.TradePulse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Optional method to find user by username
    Optional<User> findByUsername(String username);

    // Optional method to find user by email
    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);
}
