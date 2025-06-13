package com.ved.TradePulse.dtos;

import com.ved.TradePulse.entity.Workout;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutHistoryResponse {
    private List<Workout> firstPeriodData;
    private List<Workout> secondPeriodData;
}
