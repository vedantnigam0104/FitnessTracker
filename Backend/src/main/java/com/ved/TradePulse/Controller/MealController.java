package com.ved.TradePulse.Controller;

import com.ved.TradePulse.entity.MealData;
import com.ved.TradePulse.repository.MealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/meals")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend requests (adjust if needed)
public class MealController {

    @Autowired
    private MealRepository mealRepository;

    // ✅ Create a meal log
    @PostMapping
    public MealData createMeal(@RequestBody MealData meal) {
        if (meal.getMealTime() == null) {
            meal.setMealTime(LocalDateTime.now());
        }
        return mealRepository.save(meal);
    }

    // ✅ Get all meals by user email
    @GetMapping("/{email}")
    public List<MealData> getMealsByUser(@PathVariable String email) {
        return mealRepository.findByUserEmail(email);
    }

    // ✅ (Optional) Get meals by date range
    @GetMapping("/{email}/range")
    public List<MealData> getMealsByDateRange(
            @PathVariable String email,
            @RequestParam("start") String start,
            @RequestParam("end") String end) {
        LocalDateTime startDate = LocalDateTime.parse(start);
        LocalDateTime endDate = LocalDateTime.parse(end);
        return mealRepository.findByUserEmailAndMealTimeBetween(email, startDate, endDate);
    }
}

