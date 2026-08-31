package co.za.funeralcover.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

public record RecordClaimRequest(
        @NotNull(message = "Date of death is required")
        @PastOrPresent(message = "Date of death cannot be in the future")
        LocalDate dateOfDeath,

        String notes,

        /**
         * Null means the primary member. Non-null must be one of that
         * member's own dependents.
         */
        Long dependentId
) {
}
