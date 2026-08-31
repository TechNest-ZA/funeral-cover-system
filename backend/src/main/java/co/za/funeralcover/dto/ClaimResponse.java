package co.za.funeralcover.dto;

import co.za.funeralcover.entity.Claim;

import java.time.Instant;
import java.time.LocalDate;

public record ClaimResponse(
        Long id,
        Long dependentId,
        String dependentName,
        String dependentRelationship,
        LocalDate dateOfDeath,
        String notes,
        String recordedBy,
        Instant createdAt
) {
    public static ClaimResponse from(Claim claim) {
        boolean isDependent = claim.getDependent() != null;
        return new ClaimResponse(
                claim.getId(),
                isDependent ? claim.getDependent().getId() : null,
                isDependent ? claim.getDependent().getFullName() : null,
                isDependent ? claim.getDependent().getRelationship() : null,
                claim.getDateOfDeath(),
                claim.getNotes(),
                claim.getRecordedBy(),
                claim.getCreatedAt()
        );
    }
}
