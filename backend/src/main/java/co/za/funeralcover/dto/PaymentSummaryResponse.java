package co.za.funeralcover.dto;

import co.za.funeralcover.entity.Payment;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentSummaryResponse(
        Long id,
        BigDecimal amount,
        String method,
        String status,
        String reference,
        Instant paidAt,
        Instant createdAt
) {
    public static PaymentSummaryResponse from(Payment payment) {
        return new PaymentSummaryResponse(
                payment.getId(),
                payment.getAmount(),
                payment.getMethod().name(),
                payment.getStatus().name(),
                payment.getReference(),
                payment.getPaidAt(),
                payment.getCreatedAt()
        );
    }
}
