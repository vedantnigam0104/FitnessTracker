package com.ved.TradePulse.repository;

import com.ved.TradePulse.entity.FitnessData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FitnessDataRepository extends JpaRepository<FitnessData, Long> {

    List<FitnessData> findByUserId(Long userId);

    List<FitnessData> findByUserIdAndDate(Long userId, LocalDate date);

    List<FitnessData> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    // 🔹 Sum of calories burned for a given userId and date
    @Query("SELECT SUM(f.caloriesBurnt) FROM FitnessData f WHERE f.userId = :userId AND f.date = :date")
    Optional<Double> sumCaloriesBurned(Long userId, LocalDate date);

    // 🔹 Sum of distance travelled for a given userId and date
    @Query("SELECT SUM(f.distanceTravelled) FROM FitnessData f WHERE f.userId = :userId AND f.date = :date")
    Optional<Double> sumDistance(Long userId, LocalDate date);

    // 🔹 Sum of sleep (in hours) for a given userId and date
    @Query("SELECT SUM(f.sleepHours) FROM FitnessData f WHERE f.userId = :userId AND f.date = :date")
    Optional<Double> sumSleepHours(Long userId, LocalDate date);

    // 🔹 Sum of water intake for a given userId and date
    @Query("SELECT SUM(f.waterIntake) FROM FitnessData f WHERE f.userId = :userId AND f.date = :date")
    Optional<Double> sumWaterIntake(Long userId, LocalDate date);


}

