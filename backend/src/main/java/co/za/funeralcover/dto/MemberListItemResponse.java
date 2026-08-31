package co.za.funeralcover.dto;

import java.time.Instant;

public record MemberListItemResponse(
        Long id,
        String fullName,
        String idNumber,
        String planName,
        String status,
        Instant lastPaymentDate
) {
}
