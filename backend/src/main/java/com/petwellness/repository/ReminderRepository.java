package com.petwellness.repository;

import com.petwellness.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserIdAndSentFalse(Long userId);

    List<Reminder> findBySentFalseAndScheduledDateBefore(LocalDateTime dateTime);
}
