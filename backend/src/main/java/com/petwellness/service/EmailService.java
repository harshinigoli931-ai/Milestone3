package com.petwellness.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@petwellness.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.warn("Failed to send email to {}. Error: {}", to, e.getMessage());
            e.printStackTrace(); // Print full stack trace to console
            log.info("=== EMAIL (not sent) ===");
            log.info("To: {}", to);
            log.info("Subject: {}", subject);
            log.info("Body: {}", body);
            log.info("========================");
        }
    }

    public void sendCredentials(String to, String email, String password) {
        String subject = "Pet Wellness - Your Account Credentials";
        String body = String.format(
                "Welcome to Pet Wellness!\n\n" +
                        "Your account has been created. Here are your login credentials:\n\n" +
                        "Email: %s\n" +
                        "Temporary Password: %s\n\n" +
                        "Please login and change your password immediately.\n\n" +
                        "Thank you,\nPet Wellness Team",
                email, password);
        sendEmail(to, subject, body);
    }

    public void sendApprovalNotification(String to) {
        String subject = "Pet Wellness - Registration Approved";
        String body = "Congratulations!\n\n" +
                "Your registration has been approved by the admin.\n" +
                "You can now login and start using the Pet Wellness platform.\n\n" +
                "Thank you,\nPet Wellness Team";
        sendEmail(to, subject, body);
    }

    public void sendRejectionNotification(String to) {
        String subject = "Pet Wellness - Registration Rejected";
        String body = "We're sorry to inform you that your registration has been rejected.\n\n" +
                "If you believe this is an error, please contact the administrator.\n\n" +
                "Thank you,\nPet Wellness Team";
        sendEmail(to, subject, body);
    }

    public void sendVaccinationReminder(String to, String petName, String vaccineName, String dueDate) {
        String subject = "Pet Wellness - Vaccination Reminder for " + petName;
        String body = String.format(
                "This is a reminder for your pet's vaccination:\n\n" +
                        "Pet Name : %s\n" +
                        "Vaccine : %s\n" +
                        "Due Date : %s\n\n" +
                        "Please ensure your pet receives their vaccination on time to maintain optimal health.\n" +
                        "Book an appointment at your nearest vet clinic before the due date.\n\n" +
                        "Stay on top of your pet's health - a timely vaccination keeps them happy and safe!\n\n" +
                        "Regards,\n" +
                        "Pet Wellness Management System\n" +
                        "Integrated Pet Wellness & Service Platform",
                petName, vaccineName, dueDate);
        sendEmail(to, subject, body);
    }
}
