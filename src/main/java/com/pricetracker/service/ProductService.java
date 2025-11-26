package com.pricetracker.service;

import com.pricetracker.dto.ProductDTO;
import com.pricetracker.model.PriceHistory;
import com.pricetracker.model.Product;
import com.pricetracker.model.User;
import com.pricetracker.repository.ProductRepository;
import com.pricetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public Product createProduct(ProductDTO productDTO) {
        User user = userRepository.findById(productDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = new Product();
        product.setName(productDTO.getName());
        product.setUrl(productDTO.getUrl());
        product.setTargetPrice(productDTO.getTargetPrice());
        product.setUser(user);
        
        return productRepository.save(product);
    }
    
    public List<Product> getProductsByUserId(Long userId) {
        return productRepository.findByUserId(userId);
    }
    
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    @Transactional
    public Product updateProductPrice(Long productId, BigDecimal newPrice) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        BigDecimal oldPrice = product.getCurrentPrice();
        product.setCurrentPrice(newPrice);
        product.setLastChecked(LocalDateTime.now());
        
        // Save price history
        if (oldPrice == null || !oldPrice.equals(newPrice)) {
            PriceHistory priceHistory = new PriceHistory();
            priceHistory.setPrice(newPrice);
            priceHistory.setProduct(product);
            product.getPriceHistory().add(priceHistory);
        }
        
        return productRepository.save(product);
    }
    
    @Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}

