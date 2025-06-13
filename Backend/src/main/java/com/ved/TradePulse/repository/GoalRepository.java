package com.ved.TradePulse.repository;

import com.ved.TradePulse.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUserEmail(String userEmail);

    List<Goal> findByUserEmailAndDate(String userEmail, LocalDate date);

    List<Goal> findByUserEmailAndDateBetween(String userEmail, LocalDate startDate, LocalDate endDate);
}
