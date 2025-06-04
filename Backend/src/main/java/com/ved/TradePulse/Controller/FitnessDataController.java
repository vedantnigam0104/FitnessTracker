package com.ved.TradePulse.Controller;

import com.ved.TradePulse.dtos.FitnessDataRequestDTO;
import com.ved.TradePulse.entity.FitnessData;
import com.ved.TradePulse.repository.FitnessDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/fitness-data")
@RequiredArgsConstructor
public class FitnessDataController {

    private final FitnessDataRepository fitnessDataRepository;

    @PostMapping
    public ResponseEntity<String> saveFitnessData(@RequestBody FitnessDataRequestDTO request) {
        FitnessData data = FitnessData.builder()
                .userId(request.getUserId())
                .date(request.getDate())
                .workoutsDone(request.getWorkoutsDone())
                .caloriesBurnt(request.getCaloriesBurnt())
                .distanceTravelled(request.getDistanceTravelled())
                .waterIntake(request.getWaterIntake())
                .sleepHours(request.getSleepHours())
                .build();

        fitnessDataRepository.save(data);
        return ResponseEntity.ok("Fitness data saved successfully.");
    }
    @GetMapping("/weekly")
    public ResponseEntity<?> getWeeklyData(@RequestParam Long userId, @RequestParam String startDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = start.plusDays(6); // 7-day range
        return ResponseEntity.ok(fitnessDataRepository.findByUserIdAndDateBetween(userId, start, end));
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyData(@RequestParam Long userId, @RequestParam int year, @RequestParam int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return ResponseEntity.ok(fitnessDataRepository.findByUserIdAndDateBetween(userId, start, end));
    }

    @GetMapping("/yearly")
    public ResponseEntity<?> getYearlyData(@RequestParam Long userId, @RequestParam int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return ResponseEntity.ok(fitnessDataRepository.findByUserIdAndDateBetween(userId, start, end));
    }

}

