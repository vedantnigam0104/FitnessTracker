package com.ved.TradePulse.repository;

import com.ved.TradePulse.entity.MealData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MealRepository extends JpaRepository<MealData, Long> {

    // Fetch meals by user email
    List<MealData> findByUserEmail(String userEmail);

    // Optionally, fetch meals by user and date range
    List<MealData> findByUserEmailAndMealTimeBetween(String userEmail, LocalDateTime start, LocalDateTime end);
}
