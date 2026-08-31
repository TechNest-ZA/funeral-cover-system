package co.za.funeralcover.dto;

public record BookRowResponse(
        Long id,
        String fullName,
        String idNumber,
        String planName,
        String coversLabel,
        String standingStatus,
        String standingDetail
) {
}
