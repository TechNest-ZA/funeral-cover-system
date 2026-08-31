package co.za.funeralcover.dto;

import java.math.BigDecimal;

public record MonthStats(
        BigDecimal premiumsCollected,
        String premiumsNote,
        long membersPaidUp,
        long totalActive,
        String paidUpNote,
        long newMembers,
        String newMembersNote,
        long claimsThisMonth,
        String claimsNote
) {
}
