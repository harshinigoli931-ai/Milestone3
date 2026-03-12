package com.petwellness.repository;

import com.petwellness.entity.OtpVerification;
import com.petwellness.entity.enums.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByUserIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(Long userId,
            OtpPurpose purpose);

    List<OtpVerification> findByExpiryTimeBefore(LocalDateTime dateTime);

    void deleteByExpiryTimeBefore(LocalDateTime dateTime);
}
