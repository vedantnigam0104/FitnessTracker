package com.ved.TradePulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "fitness_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FitnessData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private LocalDate date;

    private int workoutsDone;

    private int caloriesBurnt;

    private double distanceTravelled;

    private int waterIntake;

    private double sleepHours;
}
