package com.ved.TradePulse.dtos;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FitnessDataRequestDTO {

    private Long userId;

    private LocalDate date;

    private int workoutsDone;

    private int caloriesBurnt;

    private double distanceTravelled;

    private int waterIntake;

    private double sleepHours;
}

