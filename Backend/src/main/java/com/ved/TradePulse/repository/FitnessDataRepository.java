package com.ved.TradePulse.repository;

import com.ved.TradePulse.entity.FitnessData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FitnessDataRepository extends JpaRepository<FitnessData, Long> {

    List<FitnessData> findByUserId(Long userId);

    List<FitnessData> findByUserIdAndDate(Long userId, LocalDate date);

    List<FitnessData> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}
