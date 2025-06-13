package com.ved.TradePulse.services;

import com.ved.TradePulse.entity.*;
import com.ved.TradePulse.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private FitnessDataRepository fitnessRepo;

    @Autowired
    private MealRepository mealRepo;

    @Autowired
    private WorkoutRepository workoutRepo;

    @Autowired
    private UserRepository userRepo;

    public Map<String, Object> compareGoalsWithActual(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        String email = user.getEmail();

        // If it's a single day comparison, make sure to handle exact date filtering
        boolean isSingleDay = startDate.equals(endDate);

        List<Goal> goals = isSingleDay
                ? goalRepository.findByUserEmailAndDate(email, startDate)
                : goalRepository.findByUserEmailAndDateBetween(email, startDate, endDate);

        List<FitnessData> fitnessData = isSingleDay
                ? fitnessRepo.findByUserIdAndDate(userId, startDate)
                : fitnessRepo.findByUserIdAndDateBetween(userId, startDate, endDate);

        List<MealData> meals = mealRepo.findByUserEmailAndMealTimeBetween(
                email, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());  // safe boundary

        List<Workout> workouts = isSingleDay
                ? workoutRepo.findByUser_IdAndWorkoutDate(userId, startDate)
                : workoutRepo.findByUserIdAndWorkoutDateBetween(userId, startDate, endDate);

        Map<String, Double> targetSums = new HashMap<>();
        Map<String, Double> actualSums = new HashMap<>();

        for (Goal goal : goals) {
            targetSums.merge(goal.getType(), goal.getTargetValue(), Double::sum);
        }

        for (Workout w : workouts) {
            String type = "workout_" + w.getType().toLowerCase();
            actualSums.merge(type, (double) w.getDurationInMinutes(), Double::sum);
        }

        for (FitnessData f : fitnessData) {
            actualSums.merge("calories_burned", (double) f.getCaloriesBurnt(), Double::sum);
            actualSums.merge("water_intake", (double) f.getWaterIntake(), Double::sum);
            actualSums.merge("distance", f.getDistanceTravelled(), Double::sum);
            actualSums.merge("sleep", f.getSleepHours(), Double::sum);
        }

        for (MealData m : meals) {
            actualSums.merge("calories_intake", m.getCalories(), Double::sum);
            actualSums.merge("protein", m.getProtein(), Double::sum);
            actualSums.merge("carbs", m.getCarbs(), Double::sum);
            actualSums.merge("fats", m.getFats(), Double::sum);
        }

        Set<String> allTypes = new HashSet<>();
        allTypes.addAll(targetSums.keySet());
        allTypes.addAll(actualSums.keySet());

        List<GoalComparisonResult> results = new ArrayList<>();
        for (String type : allTypes) {
            double target = targetSums.getOrDefault(type, 0.0);
            double actual = actualSums.getOrDefault(type, 0.0);
            results.add(new GoalComparisonResult(type, target, actual, null));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("startDate", startDate);
        response.put("endDate", endDate);
        response.put("comparisons", results);

        return response;
    }


    // Inner DTO for chart display
    public static class GoalComparisonResult {
        private String type;
        private double targetValue;
        private double actualValue;
        private LocalDate date;

        public GoalComparisonResult(String type, double targetValue, double actualValue, LocalDate date) {
            this.type = type;
            this.targetValue = targetValue;
            this.actualValue = actualValue;
            this.date = date;
        }

        public String getType() { return type; }
        public double getTargetValue() { return targetValue; }
        public double getActualValue() { return actualValue; }
        public LocalDate getDate() { return date; }

        public void setType(String type) { this.type = type; }
        public void setTargetValue(double targetValue) { this.targetValue = targetValue; }
        public void setActualValue(double actualValue) { this.actualValue = actualValue; }
        public void setDate(LocalDate date) { this.date = date; }
    }
}
