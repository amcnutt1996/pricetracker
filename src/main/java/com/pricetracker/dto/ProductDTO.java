package com.pricetracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    
    @NotBlank(message = "Product name is required")
    private String name;
    
    @NotBlank(message = "Product URL is required")
    private String url;
    
    private BigDecimal targetPrice;
    
    @NotNull(message = "User ID is required")
    private Long userId;
}

