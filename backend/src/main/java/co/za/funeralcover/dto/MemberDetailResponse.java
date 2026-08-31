package co.za.funeralcover.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record MemberDetailResponse(
        Long id,
        String fullName,
        String idNumber,
        String phone,
        String beneficiaryName,
        String beneficiaryRelationship,
        String beneficiaryPhone,
        String beneficiaryIdNumber,
        String email,
        String planName,
        BigDecimal monthlyPremium,
        BigDecimal coverAmount,
        List<String> benefits,
        String status,
        Instant signupDate,
        List<PaymentSummaryResponse> payments,
        List<DependentResponse> dependents,
        List<ClaimResponse> claims
) {
}
