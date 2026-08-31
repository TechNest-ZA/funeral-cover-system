package co.za.funeralcover.dto;

public record DashboardStatsResponse(
        long totalMembers,
        long paidThisMonth,
        long outstandingCount
) {
}
