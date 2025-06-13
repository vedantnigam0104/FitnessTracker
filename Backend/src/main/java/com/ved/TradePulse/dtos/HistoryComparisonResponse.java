package com.ved.TradePulse.dtos;

import com.ved.TradePulse.entity.FitnessData;
import java.util.List;

public class HistoryComparisonResponse {

    private List<FitnessData> firstPeriodData;
    private List<FitnessData> secondPeriodData;

    public HistoryComparisonResponse(List<FitnessData> firstPeriodData, List<FitnessData> secondPeriodData) {
        this.firstPeriodData = firstPeriodData;
        this.secondPeriodData = secondPeriodData;
    }

    public List<FitnessData> getFirstPeriodData() {
        return firstPeriodData;
    }

    public void setFirstPeriodData(List<FitnessData> firstPeriodData) {
        this.firstPeriodData = firstPeriodData;
    }

    public List<FitnessData> getSecondPeriodData() {
        return secondPeriodData;
    }

    public void setSecondPeriodData(List<FitnessData> secondPeriodData) {
        this.secondPeriodData = secondPeriodData;
    }
}
