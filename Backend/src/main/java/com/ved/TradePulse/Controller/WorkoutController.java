package com.ved.TradePulse.Controller;

import com.ved.TradePulse.entity.User;
import com.ved.TradePulse.entity.Workout;
import com.ved.TradePulse.repository.UserRepository;
import com.ved.TradePulse.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkoutController {

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ POST - Create a new workout using email
    @PostMapping
    public String createWorkout(@RequestParam String email, @RequestBody Workout workout) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        workout.setUser(user);
        workoutRepository.save(workout);
        return "Workout saved successfully";
    }

    // ✅ GET - Fetch all workouts by user email
    @GetMapping("/{email}")
    public List<Workout> getAllWorkouts(@PathVariable String email) {
        return workoutRepository.findByUserEmail(email);
    }

    // ✅ GET - Fetch workouts for a user in a specific date range
    @GetMapping("/{email}/range")
    public List<Workout> getWorkoutsInDateRange(
            @PathVariable String email,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        return workoutRepository.findByUserIdAndWorkoutDateBetween(user.getId(), start, end);
    }

    // ✅ DELETE - Remove a workout by ID
    @DeleteMapping("/{id}")
    public String deleteWorkout(@PathVariable Long id) {
        if (!workoutRepository.existsById(id)) {
            return "Workout not found with id: " + id;
        }
        workoutRepository.deleteById(id);
        return "Workout deleted successfully";
    }
}
