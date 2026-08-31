package co.za.funeralcover.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record MemberBookResponse(
        Long memberId,
        String memberNumber,
        String fullName,
        String planName,
        BigDecimal monthlyPremium,
        BigDecimal coverAmount,
        List<String> benefits,
        String status,
        Instant signupDate,
        Instant nextDueDate,
        List<PaymentSummaryResponse> payments,
        List<DependentResponse> dependents
) {
}
