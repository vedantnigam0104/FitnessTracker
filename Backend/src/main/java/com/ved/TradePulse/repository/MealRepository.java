package com.ved.TradePulse.repository;

import com.ved.TradePulse.entity.MealData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Repository
public interface MealRepository extends JpaRepository<MealData, Long> {

    List<MealData> findByUserEmail(String userEmail);

    List<MealData> findByUserEmailAndMealTimeBetween(String userEmail, LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(m.calories) FROM MealData m WHERE m.userEmail = :email AND m.mealTime BETWEEN :start AND :end")
    Optional<Double> sumCalories(String email, LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(m.protein) FROM MealData m WHERE m.userEmail = :email AND m.mealTime BETWEEN :start AND :end")
    Optional<Double> sumProtein(String email, LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(m.carbs) FROM MealData m WHERE m.userEmail = :email AND m.mealTime BETWEEN :start AND :end")
    Optional<Double> sumCarbs(String email, LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(m.fats) FROM MealData m WHERE m.userEmail = :email AND m.mealTime BETWEEN :start AND :end")
    Optional<Double> sumFats(String email, LocalDateTime start, LocalDateTime end);
}
