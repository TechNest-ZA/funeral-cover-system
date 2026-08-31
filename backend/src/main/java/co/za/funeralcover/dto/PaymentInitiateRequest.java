package co.za.funeralcover.dto;

import co.za.funeralcover.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record PaymentInitiateRequest(
        @NotNull(message = "Member id is required")
        Long memberId,

        @NotNull(message = "Payment method is required")
        PaymentMethod method
) {
}
