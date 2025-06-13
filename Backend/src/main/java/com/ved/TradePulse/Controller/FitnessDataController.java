package com.ved.TradePulse.Controller;

import com.ved.TradePulse.dtos.FitnessDataRequestDTO;
import com.ved.TradePulse.entity.FitnessData;
import com.ved.TradePulse.entity.User;
import com.ved.TradePulse.repository.FitnessDataRepository;
import com.ved.TradePulse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/fitness-data")
@RequiredArgsConstructor
public class FitnessDataController {

    @Autowired
    private final UserRepository userRepository;

    private final FitnessDataRepository fitnessDataRepository;

    // Save new fitness data
    @PostMapping
    public ResponseEntity<String> saveFitnessData(@RequestBody FitnessDataRequestDTO request) {
        FitnessData data = FitnessData.builder()
                .userId(request.getUserId())
                .date(request.getDate())
                .caloriesBurnt(request.getCaloriesBurnt())
                .distanceTravelled(request.getDistanceTravelled())
                .waterIntake(request.getWaterIntake())
                .sleepHours(request.getSleepHours())
                .build();

        fitnessDataRepository.save(data);
        return ResponseEntity.ok("Fitness data saved successfully.");
    }

    // Weekly fitness data (7-day range from start)
    @GetMapping("/weekly")
    public ResponseEntity<?> getWeeklyData(@RequestParam Long userId, @RequestParam String startDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = start.plusDays(6);
        return ResponseEntity.ok(fitnessDataRepository.findByUserIdAndDateBetween(userId, start, end));
    }

    // Monthly fitness data
    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyData(@RequestParam Long userId, @RequestParam int year, @RequestParam int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return ResponseEntity.ok(fitnessDataRepository.findByUserIdAndDateBetween(userId, start, end));
    }

    // Yearly fitness data
    @GetMapping("/yearly")
    public ResponseEntity<?> getYearlyData(@RequestParam Long userId, @RequestParam int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return ResponseEntity.ok(fitnessDataRepository.findByUserIdAndDateBetween(userId, start, end));
    }

    // History data using email → internally maps to userId
    @GetMapping("/history/{email}")
    public ResponseEntity<List<FitnessData>> getFitnessHistory(
            @PathVariable String email,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(6);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<FitnessData> data = fitnessDataRepository.findByUserIdAndDateBetween(user.getId(), start, end);
        return ResponseEntity.ok(data);
    }
}
