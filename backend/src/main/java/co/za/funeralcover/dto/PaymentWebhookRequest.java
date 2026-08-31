package co.za.funeralcover.dto;

/**
 * Placeholder shape for the payment gateway ITN callback. Will be replaced
 * with PayFast's actual field names (m_payment_id, pf_payment_id,
 * payment_status, signature, ...) plus signature verification when the real
 * PayFast sandbox integration is wired up.
 */
public record PaymentWebhookRequest(
        String reference,
        String status
) {
}
