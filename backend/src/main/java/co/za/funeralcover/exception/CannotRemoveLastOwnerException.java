package co.za.funeralcover.exception;

public class CannotRemoveLastOwnerException extends RuntimeException {
    public CannotRemoveLastOwnerException(String message) {
        super(message);
    }
}
