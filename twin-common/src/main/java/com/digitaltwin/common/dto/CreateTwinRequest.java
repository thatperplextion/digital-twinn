package com.digitaltwin.common.dto;

import com.digitaltwin.common.model.DigitalTwin;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.*;

/**
 * DTO for creating a new Digital Twin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTwinRequest {
    
    @NotBlank(message = "Entity type is required")
    private String entityType;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    @Builder.Default
    private Map<String, Object> staticAttributes = new HashMap<>();
    
    @Builder.Default
    private Map<String, Object> initialState = new HashMap<>();
    
    @Builder.Default
    private Set<String> tags = new HashSet<>();
    
    private String tenantId;
}
