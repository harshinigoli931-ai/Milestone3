package com.petwellness.repository;

import com.petwellness.entity.Vaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {
    List<Vaccination> findByPetId(Long petId);

    List<Vaccination> findByPetIdAndCompletedFalse(Long petId);

    List<Vaccination> findByNextDueDateBetweenAndCompletedFalse(LocalDate start, LocalDate end);

    List<Vaccination> findByNextDueDateAndCompletedFalse(LocalDate date);
}
