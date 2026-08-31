package co.za.funeralcover.dto;

import co.za.funeralcover.entity.Plan;

import java.math.BigDecimal;
import java.util.List;

public record PlanResponse(
        Long id,
        String name,
        BigDecimal monthlyPremium,
        BigDecimal coverAmount,
        String description,
        List<String> benefits
) {
    public static PlanResponse from(Plan plan) {
        return new PlanResponse(
                plan.getId(),
                plan.getName(),
                plan.getMonthlyPremium(),
                plan.getCoverAmount(),
                plan.getDescription(),
                plan.getBenefitsList()
        );
    }
}
