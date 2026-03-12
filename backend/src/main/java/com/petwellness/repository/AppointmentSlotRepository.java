package com.petwellness.repository;

import com.petwellness.entity.AppointmentSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Long> {
    List<AppointmentSlot> findByAvailableTrueAndDateGreaterThanEqual(LocalDate date);

    List<AppointmentSlot> findByDateBetween(LocalDate start, LocalDate end);

    List<AppointmentSlot> findByDate(LocalDate date);
}
