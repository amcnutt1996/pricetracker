package com.pricetracker.controller;

import com.pricetracker.service.ScrapingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/scraping")
@RequiredArgsConstructor
public class ScrapingController {
    
    private final ScrapingService scrapingService;
    
    @PostMapping("/check-price")
    public ResponseEntity<Map<String, Object>> checkPrice(@RequestBody Map<String, String> request) {
        String url = request.get("url");
        if (url == null || url.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "URL is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        BigDecimal price = scrapingService.scrapePrice(url);
        
        Map<String, Object> response = new HashMap<>();
        if (price != null) {
            response.put("url", url);
            response.put("price", price);
            response.put("success", true);
            return ResponseEntity.ok(response);
        } else {
            response.put("url", url);
            response.put("error", "Could not extract price from URL");
            response.put("success", false);
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/check-all")
    public ResponseEntity<Map<String, String>> checkAllProducts() {
        scrapingService.checkAllProducts();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Price check initiated for all products");
        return ResponseEntity.ok(response);
    }
}

