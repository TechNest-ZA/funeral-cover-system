package co.za.funeralcover.exception;

public class DuplicateClaimException extends RuntimeException {
    public DuplicateClaimException(String message) {
        super(message);
    }
}
