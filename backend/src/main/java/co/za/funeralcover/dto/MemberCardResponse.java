package co.za.funeralcover.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record MemberCardResponse(
        Long memberId,
        String memberNumber,
        String fullName,
        String planName,
        BigDecimal monthlyPremium,
        BigDecimal coverAmount,
        List<String> benefits,
        String status,
        Instant signupDate
) {
}
