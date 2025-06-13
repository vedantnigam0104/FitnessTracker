package com.ved.TradePulse.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MealHistoryResponse {
    private Double firstCalories;
    private Double firstProtein;
    private Double firstCarbs;
    private Double firstFats;

    private Double secondCalories;
    private Double secondProtein;
    private Double secondCarbs;
    private Double secondFats;
}
