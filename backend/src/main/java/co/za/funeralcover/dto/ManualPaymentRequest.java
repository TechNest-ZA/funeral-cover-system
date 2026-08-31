package co.za.funeralcover.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ManualPaymentRequest(
        @NotNull(message = "Member id is required")
        Long memberId,

        /** Optional - defaults to the member's plan monthly premium if omitted. */
        BigDecimal amount,

        /** Optional - a system reference is generated if omitted. */
        String reference
) {
}
