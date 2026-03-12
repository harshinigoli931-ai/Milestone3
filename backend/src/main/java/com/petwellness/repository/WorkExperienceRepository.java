package com.petwellness.repository;

import com.petwellness.entity.WorkExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {
    Optional<WorkExperience> findByUserId(Long userId);
}
