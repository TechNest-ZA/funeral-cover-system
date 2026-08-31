package co.za.funeralcover.dto;

import jakarta.validation.constraints.NotBlank;

public record DependentRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        String idNumber,

        @NotBlank(message = "Relationship is required")
        String relationship
) {
}
