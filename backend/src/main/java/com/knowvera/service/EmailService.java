package com.knowvera.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.knowvera.model.Book;
import com.knowvera.model.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@knowvera.local}")
    private String fromAddress;

    public void sendReservationReadyEmail(User user, Book book) {
        if (user == null || book == null) {
            return;
        }
        String to = user.getEmail();
        if (to == null || to.trim().isEmpty()) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Book ready for pickup: " + safe(book.getTitle()));
        message.setText("Your reserved book is now available. Please collect it within 24 hours.\n\nBook: "
                + safe(book.getTitle()) + "\nISBN: " + safe(book.getIsbn()) + "\n\nThank you.\nTeam Knowvera.");

        try {
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send reservation email to {}", to, ex);
        }
    }

    public void sendVerificationEmail(User user, String verifyUrl) {
        if (user == null) {
            return;
        }
        String to = user.getEmail();
        if (to == null || to.trim().isEmpty()) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Verify your email address");
        message.setText("Please verify your email by clicking this link:\n\n" + verifyUrl
                + "\n\nIf you didn't request this, you can ignore this email.");

        try {
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send verification email to {}", to, ex);
        }
    }

    private String safe(String value) {
        return value == null ? "-" : value;
    }
}
