package co.za.funeralcover.dto;

import java.math.BigDecimal;

public record FuneralAttribution(
        long newMembersThisMonth,
        BigDecimal extraMonthlyPremium,
        String bestServiceLabel,
        Long bestServiceCount
) {
}
