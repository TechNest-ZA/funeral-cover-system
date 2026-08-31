package co.za.funeralcover.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record FuneralEventCreateRequest(
        @NotBlank(message = "Give this service a label, e.g. the family surname")
        String label,

        @NotNull(message = "Service date is required")
        LocalDate serviceDate
) {
}
