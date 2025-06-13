package com.ved.TradePulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "workouts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate workoutDate;

    private String type;  // e.g., "Cardio", "Yoga", etc.

    private int durationInMinutes;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
