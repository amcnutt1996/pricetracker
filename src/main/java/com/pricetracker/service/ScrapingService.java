package com.pricetracker.service;

import com.pricetracker.model.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScrapingService {
    
    private final ProductService productService;
    
    @Value("${app.python.script-path}")
    private String pythonScriptPath;
    
    public BigDecimal scrapePrice(String url) {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "python3", 
                    pythonScriptPath, 
                    url
            );
            processBuilder.redirectErrorStream(true);
            
            Process process = processBuilder.start();
            
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream())
            );
            
            String line;
            StringBuilder output = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            int exitCode = process.waitFor();
            
            if (exitCode == 0) {
                String priceStr = output.toString().trim();
                return new BigDecimal(priceStr);
            } else {
                log.error("Python script failed with exit code: {}", exitCode);
                log.error("Output: {}", output.toString());
                return null;
            }
        } catch (Exception e) {
            log.error("Error executing Python scraper: ", e);
            return null;
        }
    }
    
    public void checkAllProducts() {
        List<Product> products = productService.getAllProducts();
        log.info("Checking prices for {} products", products.size());
        
        for (Product product : products) {
            try {
                BigDecimal scrapedPrice = scrapePrice(product.getUrl());
                if (scrapedPrice != null) {
                    productService.updateProductPrice(product.getId(), scrapedPrice);
                    log.info("Updated price for product {}: {}", product.getName(), scrapedPrice);
                }
            } catch (Exception e) {
                log.error("Error checking price for product {}: ", product.getName(), e);
            }
        }
    }
}

