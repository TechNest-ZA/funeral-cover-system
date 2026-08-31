package co.za.funeralcover.exception;

public class PaymentGatewayNotConfiguredException extends RuntimeException {
    public PaymentGatewayNotConfiguredException(String message) {
        super(message);
    }
}
