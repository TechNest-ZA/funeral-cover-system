package co.za.funeralcover.dto;

public record PaymentInitiateResponse(
        Long paymentId,
        String status,
        boolean fake,
        String redirectUrl,
        String reference
) {
}
