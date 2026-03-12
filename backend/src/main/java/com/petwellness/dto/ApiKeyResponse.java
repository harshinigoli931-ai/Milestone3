package com.petwellness.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKeyResponse {
    private Long id;
    private String keyValue;
    private String name;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime lastUsedAt;
}
