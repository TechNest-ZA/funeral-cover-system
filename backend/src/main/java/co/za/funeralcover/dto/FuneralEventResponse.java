package co.za.funeralcover.dto;

import co.za.funeralcover.entity.FuneralEvent;

import java.time.LocalDate;

public record FuneralEventResponse(
        Long id,
        String label,
        LocalDate serviceDate,
        String qrToken,
        String signupUrl,
        long totalSignups,
        long signupsThisMonth
) {
    public static FuneralEventResponse from(FuneralEvent event, String signupUrl, long totalSignups, long signupsThisMonth) {
        return new FuneralEventResponse(
                event.getId(),
                event.getLabel(),
                event.getServiceDate(),
                event.getQrToken(),
                signupUrl,
                totalSignups,
                signupsThisMonth
        );
    }
}
