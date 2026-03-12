package com.petwellness.repository;

import com.petwellness.entity.Appointment;
import com.petwellness.entity.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByOwnerId(Long ownerId);

    List<Appointment> findByOwnerIdAndStatus(Long ownerId, AppointmentStatus status);

    List<Appointment> findBySlotId(Long slotId);

    long countBySlotIdAndStatusNot(Long slotId, AppointmentStatus status);

    boolean existsBySlotIdAndPreferredTimeAndStatusNot(Long slotId, LocalTime preferredTime, AppointmentStatus status);

    List<Appointment> findBySlotIdAndStatusNot(Long slotId, AppointmentStatus status);
}
