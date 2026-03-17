package com.petwellness.service;

import com.petwellness.entity.Order;
import com.petwellness.entity.OrderItem;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;

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

    public void sendOrderConfirmationEmail(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(order.getOwner().getEmail());
            helper.setSubject("Pet Wellness - Order Confirmation #" + order.getId());

            StringBuilder rows = new StringBuilder();
            for (OrderItem item : order.getItems()) {
                rows.append("<tr>")
                    .append("<td style='padding: 12px; border-bottom: 1px solid #eee;'>")
                    .append("<div style='display: flex; align-items: center;'>")
                    .append("<div style='margin-left: 10px;'>")
                    .append("<p style='font-weight: bold; margin: 0;'>").append(item.getProduct().getName()).append("</p>")
                    .append("</div></div>")
                    .append("</td>")
                    .append("<td style='padding: 12px; border-bottom: 1px solid #eee; text-align: center;'>").append(item.getQuantity()).append("</td>")
                    .append("<td style='padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #ff9900;'>₹").append(item.getTotalPrice()).append("</td>")
                    .append("</tr>");
            }

            String htmlTemplate = 
                "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <style>" +
                "        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                "        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }" +
                "        .header { background: #ff9900; color: white; padding: 30px; text-align: center; }" +
                "        .content { padding: 40px; }" +
                "        .order-details { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 25px; }" +
                "        .item-table { w-full; border-collapse: collapse; margin-top: 20px; }" +
                "        .item-table th { background-color: #f8f8f8; color: #555; font-size: 13px; font-weight: bold; text-transform: uppercase; padding: 12px; text-align: left; }" +
                "        .total-section { margin-top: 30px; text-align: right; border-top: 2px solid #ff9900; padding-top: 20px; }" +
                "        .total { font-weight: 800; font-size: 1.5em; color: #ff9900; }" +
                "        .footer { background: #1a1a1a; color: #999; text-align: center; padding: 20px; font-size: 0.85em; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'><h1>🛍️ Order Confirmed!</h1></div>" +
                "        <div class='content'>" +
                "            <p>Hello,</p>" +
                "            <p>Thank you for choosing Pet Wellness. We've received your order and are preparing it for shipment.</p>" +
                "            <div class='order-details'>" +
                "                <p style='margin: 4px 0;'><strong>Order ID:</strong> #" + order.getId() + "</p>" +
                "                <p style='margin: 4px 0;'><strong>Expected Delivery:</strong> " + (order.getExpectedDeliveryDate() != null ? order.getExpectedDeliveryDate().toLocalDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) : "N/A") + "</p>" +
                "                <p style='margin: 4px 0;'><strong>Payment Method:</strong> " + (order.getPaymentMethod() != null ? order.getPaymentMethod() : "N/A") + "</p>" +
                "            </div>" +
                "            <h3>Items Ordered</h3>" +
                "            <table style='width: 100%; border-collapse: collapse;'>" +
                "                <thead>" +
                "                    <tr style='background: #f8f8f8;'>" +
                "                        <th style='padding: 12px; text-align: left; font-size: 12px;'>Item</th>" +
                "                        <th style='padding: 12px; text-align: center; font-size: 12px;'>Qty</th>" +
                "                        <th style='padding: 12px; text-align: right; font-size: 12px;'>Price</th>" +
                "                    </tr>" +
                "                </thead>" +
                "                <tbody>" +
                rows.toString() +
                "                </tbody>" +
                "            </table>" +
                "            <div class='total-section'>" +
                "                <span style='color: #555;'>Total Amount: </span>" +
                "                <span class='total'>₹" + order.getTotalAmount() + "</span>" +
                "            </div>" +
                "        </div>" +
                "        <div class='footer'>© 2026 Pet Wellness & Service Management. All rights reserved.</div>" +
                "    </div>" +
                "</body>" +
                "</html>";

            helper.setText(htmlTemplate, true);
            mailSender.send(message);
            log.info("Order confirmation email sent to: {}", order.getOwner().getEmail());
        } catch (Exception e) {
            log.warn("Failed to send order email. Error: {}", e.getMessage());
            e.printStackTrace(); // Added to debug failures
        }
    }
}
