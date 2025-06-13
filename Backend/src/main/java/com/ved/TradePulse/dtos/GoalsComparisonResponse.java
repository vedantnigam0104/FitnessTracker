package com.ved.TradePulse.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalsComparisonResponse {
    private String type;
    private String unit;
    private double targetValue;
    private double actualValue;
    private LocalDate date;
}
