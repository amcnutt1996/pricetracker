package com.pricetracker.service;

import com.pricetracker.model.PriceHistory;
import com.pricetracker.model.Product;
import com.pricetracker.model.User;
import com.pricetracker.repository.PriceHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PriceCheckScheduler {
    
    private final ScrapingService scrapingService;
    private final ProductService productService;
    private final EmailService emailService;
    private final PriceHistoryRepository priceHistoryRepository;
    
    @Scheduled(fixedRateString = "${app.scraping.interval-ms:3600000}", initialDelay = 60000)
    public void checkPrices() {
        log.info("Starting scheduled price check...");
        scrapingService.checkAllProducts();
        checkForPriceDrops();
    }
    
    private void checkForPriceDrops() {
        List<Product> products = productService.getAllProducts();
        
        for (Product product : products) {
            if (product.getCurrentPrice() == null) {
                continue;
            }
            
            List<PriceHistory> history = priceHistoryRepository.findByProductIdOrderByRecordedAtDesc(product.getId());
            if (history.size() < 2) {
                continue;
            }
            
            BigDecimal currentPrice = product.getCurrentPrice();
            BigDecimal previousPrice = history.get(1).getPrice(); // Second most recent (index 1, since 0 is current)
            
            // Check if price dropped
            if (currentPrice.compareTo(previousPrice) < 0) {
                User user = product.getUser();
                emailService.sendPriceDropNotification(
                        user, 
                        product, 
                        previousPrice, 
                        currentPrice
                );
            }
            
            // Check if target price reached
            if (product.getTargetPrice() != null && 
                currentPrice.compareTo(product.getTargetPrice()) <= 0) {
                User user = product.getUser();
                emailService.sendTargetPriceReachedNotification(user, product);
            }
        }
    }
}

