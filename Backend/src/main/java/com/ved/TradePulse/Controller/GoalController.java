package com.ved.TradePulse.Controller;

import com.ved.TradePulse.entity.Goal;
import com.ved.TradePulse.entity.User;
import com.ved.TradePulse.repository.GoalRepository;
import com.ved.TradePulse.repository.UserRepository;
import com.ved.TradePulse.services.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "http://localhost:5173")
public class GoalController {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private GoalService goalService;

    @Autowired
    private UserRepository userRepository;

    // ✅ Create a new goal
    @PostMapping
    public Goal createGoal(@RequestBody Goal goal) {
        if (goal.getUserEmail() == null || goal.getDate() == null || goal.getType() == null) {
            throw new IllegalArgumentException("Missing required goal fields.");
        }

        if (goal.getUnit() == null || goal.getUnit().isEmpty()) {
            goal.setUnit(getDefaultUnit(goal.getType()));
        }

        return goalRepository.save(goal);
    }

    // ✅ Get all goals by user email
    @GetMapping("/{email}")
    public List<Goal> getGoalsByEmail(@PathVariable String email) {
        return goalRepository.findByUserEmail(email);
    }

    // ✅ Get goals by user email and specific date
    @GetMapping("/{email}/date/{date}")
    public List<Goal> getGoalsByEmailAndDate(@PathVariable String email, @PathVariable String date) {
        LocalDate goalDate = LocalDate.parse(date);
        return goalRepository.findByUserEmailAndDate(email, goalDate);
    }

    // ✅ Compare goals vs actual data (supports ?period=weekly etc.)
    @GetMapping("/{email}/compare")
    public Map<String, Object> compareGoals(
            @PathVariable String email,
            @RequestParam String period,
            @RequestParam(required = false) String date
    ) {
        LocalDate now = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        switch (period.toLowerCase()) {
            case "daily":
                startDate = now;
                endDate = now;
                break;
            case "weekly":
                startDate = now.minusDays(6);
                endDate = now;
                break;
            case "monthly":
                startDate = now.withDayOfMonth(1);
                endDate = now;
                break;
            case "yearly":
                startDate = now.withDayOfYear(1);
                endDate = now;
                break;
            default:
                throw new IllegalArgumentException("Invalid period: " + period);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        return goalService.compareGoalsWithActual(user.getId(), startDate, endDate);
    }

    // ✅ New: Compare goals by email and date range (advanced use)
    @GetMapping("/email/compare")
    public Map<String, Object> compareGoalsByEmail(
            @RequestParam String email,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        return goalService.compareGoalsWithActual(user.getId(), startDate, endDate);
    }

    // ✅ Delete a goal
    @DeleteMapping("/{id}")
    public void deleteGoal(@PathVariable Long id) {
        goalRepository.deleteById(id);
    }

    // ✅ Default unit logic
    private String getDefaultUnit(String type) {
        if (type.startsWith("workout_")) return "minutes";
        if (type.equals("sleep")) return "hours";
        if (type.equals("distance")) return "km";
        if (type.equals("water_intake") || type.equals("protein") ||
                type.equals("carbs") || type.equals("fats") || type.equals("calories_intake")) return "g";
        if (type.equals("calories_burned")) return "kcal";
        return "units";
    }
}
