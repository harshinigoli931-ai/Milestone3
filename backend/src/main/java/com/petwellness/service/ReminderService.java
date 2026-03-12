package com.petwellness.service;

import com.petwellness.entity.Vaccination;
import com.petwellness.repository.VaccinationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReminderService {

    private static final Logger log = LoggerFactory.getLogger(ReminderService.class);

    private final VaccinationRepository vaccinationRepository;
    private final EmailService emailService;

    public ReminderService(VaccinationRepository vaccinationRepository, EmailService emailService) {
        this.vaccinationRepository = vaccinationRepository;
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void sendVaccinationReminders() {
        log.info("Running vaccination reminder check...");

        LocalDate today = LocalDate.now();

        // Find vaccinations due today that are not yet completed
        List<Vaccination> dueToday = vaccinationRepository
                .findByNextDueDateAndCompletedFalse(today);

        for (Vaccination vac : dueToday) {
            sendReminderImmediately(vac);
        }

        log.info("Vaccination reminder check complete. {} reminders processed.", dueToday.size());
    }

    /**
     * Sends a reminder immediately for a given vaccination record.
     */
    public void sendReminderImmediately(Vaccination vac) {
        try {
            String ownerEmail = vac.getPet().getOwner().getEmail();
            emailService.sendVaccinationReminder(
                    ownerEmail,
                    vac.getPet().getName(),
                    vac.getVaccineName(),
                    vac.getNextDueDate().toString());
            log.info("Sent immediate vaccination reminder for pet: {} vaccine: {}",
                    vac.getPet().getName(), vac.getVaccineName());
        } catch (Exception e) {
            log.error("Failed to send immediate reminder for vaccination id: {}", vac.getId(), e);
        }
    }
}
