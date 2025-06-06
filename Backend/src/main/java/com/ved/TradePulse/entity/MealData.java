package com.ved.TradePulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "meals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;  // Or userId if you're using user entity

    private String mealType;   // e.g. Breakfast, Lunch, Dinner, Snack

    private String foodName;

    private double quantity;

    private double calories;

    private double protein;

    private double carbs;

    private double fats;

    private LocalDateTime mealTime;

    private LocalDateTime createdAt = LocalDateTime.now();
}
