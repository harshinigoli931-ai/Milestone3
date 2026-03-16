package com.petwellness.service;

import com.petwellness.dto.AppointmentRequest;
import com.petwellness.dto.AppointmentResponse;
import com.petwellness.dto.AppointmentSlotRequest;
import com.petwellness.entity.Appointment;
import com.petwellness.entity.AppointmentSlot;
import com.petwellness.entity.Pet;
import com.petwellness.entity.User;
import com.petwellness.entity.enums.AppointmentStatus;
import com.petwellness.entity.enums.ConsultationType;
import com.petwellness.exception.BadRequestException;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.repository.AppointmentRepository;
import com.petwellness.repository.AppointmentSlotRepository;
import com.petwellness.repository.PetRepository;
import com.petwellness.repository.UserRepository;
import com.petwellness.entity.Vet;
import com.petwellness.repository.VetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentSlotRepository slotRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final VetRepository vetRepository;

    public AppointmentService(AppointmentSlotRepository slotRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            PetRepository petRepository,
            VetRepository vetRepository) {
        this.slotRepository = slotRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.vetRepository = vetRepository;
    }

    // ========== Admin: Slot Management ==========

    @Transactional
    public AppointmentSlot createSlot(AppointmentSlotRequest request) {
        // Auto-calculate max bookings based on slot duration in 10-minute intervals
        int calculatedMax = 1;
        if (request.getStartTime() != null && request.getEndTime() != null) {
            long durationMinutes = java.time.Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
            calculatedMax = Math.max(1, (int) (durationMinutes / 10));
        }

        Vet vet = null;
        if (request.getVetId() != null) {
            vet = vetRepository.findById(request.getVetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vet not found"));
        }

        AppointmentSlot slot = AppointmentSlot.builder()
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .consultationType(ConsultationType.valueOf(request.getConsultationType()))
                .vet(vet)
                .vetName(request.getVetName())
                .available(true)
                .maxBookings(request.getMaxBookings() != null ? request.getMaxBookings() : calculatedMax)
                .currentBookings(0)
                .build();
        return slotRepository.save(slot);
    }

    @Transactional
    public AppointmentSlot updateSlot(Long slotId, AppointmentSlotRequest request) {
        AppointmentSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));
        slot.setDate(request.getDate());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setConsultationType(ConsultationType.valueOf(request.getConsultationType()));
        slot.setVetName(request.getVetName());

        if (request.getVetId() != null) {
            Vet vet = vetRepository.findById(request.getVetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vet not found"));
            slot.setVet(vet);
        }

        if (request.getMaxBookings() != null) {
            if (request.getMaxBookings() < slot.getCurrentBookings()) {
                throw new BadRequestException("Max bookings cannot be less than current bookings");
            }
            slot.setMaxBookings(request.getMaxBookings());
        } else {
            // Recalculate based on updated time range
            long durationMinutes = java.time.Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
            int calculatedMax = Math.max(1, (int) (durationMinutes / 10));
            if (calculatedMax >= slot.getCurrentBookings()) {
                slot.setMaxBookings(calculatedMax);
            }
        }
        // Re-enable slot if it has room
        if (slot.getCurrentBookings() < slot.getMaxBookings()) {
            slot.setAvailable(true);
        }
        return slotRepository.save(slot);
    }

    @Transactional
    public void deleteSlot(Long slotId) {
        AppointmentSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));
        if (slot.getCurrentBookings() > 0) {
            throw new BadRequestException("Cannot delete slot with existing bookings");
        }
        slotRepository.delete(slot);
    }

    @Transactional
    public AppointmentSlot toggleSlotAvailability(Long slotId) {
        AppointmentSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));
        slot.setAvailable(!slot.isAvailable());
        return slotRepository.save(slot);
    }

    public List<AppointmentSlot> getAllSlots() {
        return slotRepository.findAll();
    }

    // ========== Owner: Appointments ==========

    public List<AppointmentSlot> getAvailableSlots() {
        return slotRepository.findByAvailableTrueAndDateGreaterThanEqual(LocalDate.now());
    }

    @Transactional
    public AppointmentResponse bookAppointment(Long ownerId, AppointmentRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        if (!pet.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only book appointments for your own pets");
        }

        AppointmentSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (!slot.isAvailable()) {
            throw new BadRequestException("This slot is not available");
        }

        if (slot.getCurrentBookings() >= slot.getMaxBookings()) {
            throw new BadRequestException("This slot is fully booked");
        }

        // Check if the preferred time is within 10 minutes of any existing booking
        if (request.getPreferredTime() != null && !request.getPreferredTime().isEmpty()) {
            LocalTime preferredTime = LocalTime.parse(request.getPreferredTime());
            List<Appointment> activeBookings = appointmentRepository.findBySlotIdAndStatusNot(
                    slot.getId(), AppointmentStatus.CANCELLED);
            for (Appointment existing : activeBookings) {
                if (existing.getPreferredTime() != null) {
                    long minutesDiff = Math.abs(
                            java.time.Duration.between(existing.getPreferredTime(), preferredTime).toMinutes());
                    if (minutesDiff < 10) {
                        throw new BadRequestException("The preferred time " + request.getPreferredTime()
                                + " is too close to an existing booking at " + existing.getPreferredTime()
                                + ". Bookings must be at least 10 minutes apart.");
                    }
                }
            }
        }

        Appointment appointment = Appointment.builder()
                .owner(owner)
                .pet(pet)
                .slot(slot)
                .status(AppointmentStatus.BOOKED)
                .reason(request.getReason())
                .notes(request.getNotes())
                .preferredTime(request.getPreferredTime() != null && !request.getPreferredTime().isEmpty()
                        ? java.time.LocalTime.parse(request.getPreferredTime())
                        : null)
                .consultationType(
                        request.getConsultationType() != null ? ConsultationType.valueOf(request.getConsultationType())
                                : slot.getConsultationType())
                .build();
        appointment = appointmentRepository.save(appointment);

        slot.setCurrentBookings(slot.getCurrentBookings() + 1);
        if (slot.getCurrentBookings() >= slot.getMaxBookings()) {
            slot.setAvailable(false);
        }
        slotRepository.save(slot);

        return mapToResponse(appointment);
    }

    @Transactional
    public void cancelAppointment(Long ownerId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only cancel your own appointments");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        // Free up the slot
        AppointmentSlot slot = appointment.getSlot();
        slot.setCurrentBookings(Math.max(0, slot.getCurrentBookings() - 1));
        slot.setAvailable(true);
        slotRepository.save(slot);
    }

    public List<AppointmentResponse> getOwnerAppointments(Long ownerId) {
        return appointmentRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<String> getBookedTimesForSlot(Long slotId) {
        return appointmentRepository.findBySlotIdAndStatusNot(slotId, AppointmentStatus.CANCELLED)
                .stream()
                .filter(a -> a.getPreferredTime() != null)
                .map(a -> a.getPreferredTime().toString())
                .collect(Collectors.toList());
    }

    private AppointmentResponse mapToResponse(Appointment appt) {
        return AppointmentResponse.builder()
                .id(appt.getId())
                .slotId(appt.getSlot().getId())
                .date(appt.getSlot().getDate())
                .startTime(appt.getSlot().getStartTime())
                .endTime(appt.getSlot().getEndTime())
                .preferredTime(appt.getPreferredTime())
                .consultationType(appt.getConsultationType() != null ? appt.getConsultationType().name()
                        : appt.getSlot().getConsultationType().name())
                .vetName(appt.getSlot().getVet() != null ? appt.getSlot().getVet().getName() : (appt.getSlot().getVetName() != null ? appt.getSlot().getVetName() : "Dr. Not Assigned"))
                .petName(appt.getPet().getName())
                .petId(appt.getPet().getId())
                .status(appt.getStatus().name())
                .reason(appt.getReason())
                .notes(appt.getNotes())
                .build();
    }
}
