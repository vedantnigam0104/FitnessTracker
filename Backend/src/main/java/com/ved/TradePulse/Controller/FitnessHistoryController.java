package com.ved.TradePulse.Controller;

import com.ved.TradePulse.dtos.HistoryComparisonResponse;
import com.ved.TradePulse.dtos.MealHistoryResponse;
import com.ved.TradePulse.dtos.WorkoutHistoryResponse;
import com.ved.TradePulse.entity.FitnessData;
import com.ved.TradePulse.entity.Workout;
import com.ved.TradePulse.repository.FitnessDataRepository;
import com.ved.TradePulse.repository.MealRepository;
import com.ved.TradePulse.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "http://localhost:5173")
public class FitnessHistoryController {

    @Autowired
    private FitnessDataRepository fitnessRepo;

    @Autowired
    private MealRepository mealRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    // ---------------------- FITNESS HISTORY COMPARISON ---------------------- //
    @GetMapping("/compare")
    public HistoryComparisonResponse compareFitnessHistory(
            @RequestParam String type,
            @RequestParam String firstStart,
            @RequestParam String secondStart,
            @RequestParam Long userId,
            @RequestParam List<String> metrics) {

        LocalDate[] dates = calculateDateRanges(type, firstStart, secondStart);
        List<FitnessData> firstRange = fitnessRepo.findByUserIdAndDateBetween(userId, dates[0], dates[1]);
        List<FitnessData> secondRange = fitnessRepo.findByUserIdAndDateBetween(userId, dates[2], dates[3]);

        return new HistoryComparisonResponse(firstRange, secondRange);
    }

    // ---------------------- MEAL HISTORY COMPARISON ---------------------- //
    @GetMapping("/meal/compare")
    public MealHistoryResponse compareMealHistory(
            @RequestParam String type,
            @RequestParam String firstStart,
            @RequestParam String secondStart,
            @RequestParam String email) {

        LocalDate[] dates = calculateDateRanges(type, firstStart, secondStart);

        LocalDateTime firstStartDT = dates[0].atStartOfDay();
        LocalDateTime firstEndDT = dates[1].atTime(23, 59, 59);
        LocalDateTime secondStartDT = dates[2].atStartOfDay();
        LocalDateTime secondEndDT = dates[3].atTime(23, 59, 59);

        return new MealHistoryResponse(
                mealRepository.sumCalories(email, firstStartDT, firstEndDT).orElse(0.0),
                mealRepository.sumProtein(email, firstStartDT, firstEndDT).orElse(0.0),
                mealRepository.sumCarbs(email, firstStartDT, firstEndDT).orElse(0.0),
                mealRepository.sumFats(email, firstStartDT, firstEndDT).orElse(0.0),

                mealRepository.sumCalories(email, secondStartDT, secondEndDT).orElse(0.0),
                mealRepository.sumProtein(email, secondStartDT, secondEndDT).orElse(0.0),
                mealRepository.sumCarbs(email, secondStartDT, secondEndDT).orElse(0.0),
                mealRepository.sumFats(email, secondStartDT, secondEndDT).orElse(0.0)
        );
    }

    // ---------------------- DATE CALCULATION LOGIC ---------------------- //
    private LocalDate[] calculateDateRanges(String type, String firstStart, String secondStart) {
        LocalDate firstStartDate, secondStartDate, firstEnd, secondEnd;

        switch (type.toLowerCase()) {
            case "week": {
                DateTimeFormatter weekFormatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
                try {
                    firstStartDate = LocalDate.parse(firstStart.trim(), weekFormatter);
                    secondStartDate = LocalDate.parse(secondStart.trim(), weekFormatter);
                } catch (DateTimeParseException e) {
                    throw new IllegalArgumentException("Week format must be yyyy/MM/dd. Example: 2025/06/02");
                }
                firstEnd = firstStartDate.plusDays(6);
                secondEnd = secondStartDate.plusDays(6);
                break;
            }

            case "month": {
                try {
                    firstStartDate = parseMonthStringToDate(firstStart.trim());
                    secondStartDate = parseMonthStringToDate(secondStart.trim());
                } catch (DateTimeParseException e) {
                    throw new IllegalArgumentException("Month format must be 'Jan 2023'. Received: " + firstStart + ", " + secondStart);
                }
                firstEnd = firstStartDate.withDayOfMonth(firstStartDate.lengthOfMonth());
                secondEnd = secondStartDate.withDayOfMonth(secondStartDate.lengthOfMonth());
                break;
            }

            case "year": {
                try {
                    int year1 = Integer.parseInt(firstStart.trim());
                    int year2 = Integer.parseInt(secondStart.trim());
                    firstStartDate = LocalDate.of(year1, 1, 1);
                    secondStartDate = LocalDate.of(year2, 1, 1);
                    firstEnd = firstStartDate.plusYears(1).minusDays(1);
                    secondEnd = secondStartDate.plusYears(1).minusDays(1);
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException("Year format must be a 4-digit number like 2025.");
                }
                break;
            }

            default:
                throw new IllegalArgumentException("Invalid type. Allowed values: week (yyyy/MM/dd), month (Jan 2023), year (2025)");
        }

        return new LocalDate[]{firstStartDate, firstEnd, secondStartDate, secondEnd};
    }
    @GetMapping("/workout/compare")
    public WorkoutHistoryResponse compareWorkoutHistory(
            @RequestParam String type,
            @RequestParam String firstStart,
            @RequestParam String secondStart,
            @RequestParam Long userId) {

        LocalDate[] dates = calculateDateRanges(type, firstStart, secondStart);

        List<Workout> firstRange = workoutRepository.findByUser_IdAndWorkoutDateBetween(userId, dates[0], dates[1]);
        List<Workout> secondRange = workoutRepository.findByUser_IdAndWorkoutDateBetween(userId, dates[2], dates[3]);

        return new WorkoutHistoryResponse(firstRange, secondRange);
    }

    private LocalDate parseMonthStringToDate(String input) throws DateTimeParseException {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);
        return LocalDate.parse("01 " + input, formatter); // e.g., input = "Jan 2023" → "01 Jan 2023"
    }
}
