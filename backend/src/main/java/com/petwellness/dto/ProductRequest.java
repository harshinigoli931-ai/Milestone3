package com.petwellness.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    private String name;
    private String description;
    private String category; // FOOD, TOYS, MEDICINES, ACCESSORIES
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
}
