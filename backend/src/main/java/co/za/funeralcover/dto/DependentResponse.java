package co.za.funeralcover.dto;

import co.za.funeralcover.entity.Dependent;

import java.time.Instant;

public record DependentResponse(
        Long id,
        String fullName,
        String idNumber,
        String relationship,
        Instant createdAt
) {
    public static DependentResponse from(Dependent dependent) {
        return new DependentResponse(
                dependent.getId(),
                dependent.getFullName(),
                dependent.getIdNumber(),
                dependent.getRelationship(),
                dependent.getCreatedAt()
        );
    }
}
