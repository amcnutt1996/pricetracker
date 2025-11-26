package com.pricetracker.service;

import com.pricetracker.model.Product;
import com.pricetracker.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void sendPriceDropNotification(User user, Product product, BigDecimal oldPrice, BigDecimal newPrice) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Price Drop Alert: " + product.getName());
            
            String body = String.format(
                    "Hello %s,\n\n" +
                    "Great news! The price for '%s' has dropped!\n\n" +
                    "Previous Price: $%.2f\n" +
                    "Current Price: $%.2f\n" +
                    "Savings: $%.2f\n\n" +
                    "Product URL: %s\n\n" +
                    "Happy shopping!\n" +
                    "Price Tracker",
                    user.getUsername(),
                    product.getName(),
                    oldPrice,
                    newPrice,
                    oldPrice.subtract(newPrice),
                    product.getUrl()
            );
            
            message.setText(body);
            mailSender.send(message);
            log.info("Price drop notification sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Error sending email notification: ", e);
        }
    }
    
    public void sendTargetPriceReachedNotification(User user, Product product) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Target Price Reached: " + product.getName());
            
            String body = String.format(
                    "Hello %s,\n\n" +
                    "The price for '%s' has reached your target price!\n\n" +
                    "Current Price: $%.2f\n" +
                    "Target Price: $%.2f\n\n" +
                    "Product URL: %s\n\n" +
                    "Happy shopping!\n" +
                    "Price Tracker",
                    user.getUsername(),
                    product.getName(),
                    product.getCurrentPrice(),
                    product.getTargetPrice(),
                    product.getUrl()
            );
            
            message.setText(body);
            mailSender.send(message);
            log.info("Target price notification sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Error sending email notification: ", e);
        }
    }
}

