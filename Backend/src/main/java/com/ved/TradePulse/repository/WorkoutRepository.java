package com.ved.TradePulse.repository;

import com.ved.TradePulse.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    // 🔹 Find workouts by user ID (general purpose)
    List<Workout> findByUser_Id(Long userId);

    // 🔹 Find workouts by user email (used in older controller)
    List<Workout> findByUserEmail(String email);

    // 🔹 Find workouts between dates for a user
    List<Workout> findByUserIdAndWorkoutDateBetween(Long userId, LocalDate start, LocalDate end);

    // 🔹 Find workouts on a specific date for a user (✅ added for daily goals)
    List<Workout> findByUser_IdAndWorkoutDate(Long userId, LocalDate workoutDate);

    // 🔹 Sum total workout duration for a user between dates
    @Query("SELECT SUM(w.durationInMinutes) FROM Workout w WHERE w.user.id = :userId AND w.workoutDate BETWEEN :start AND :end")
    Optional<Double> sumWorkoutDuration(Long userId, LocalDate start, LocalDate end);

    // 🔹 Sum workout duration for a specific type between dates
    @Query("SELECT SUM(w.durationInMinutes) FROM Workout w WHERE w.user.id = :userId AND w.workoutDate BETWEEN :start AND :end AND LOWER(w.type) = LOWER(:type)")
    Optional<Double> sumWorkoutDurationByType(Long userId, LocalDate start, LocalDate end, String type);

    List<Workout> findByUser_IdAndWorkoutDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

}

