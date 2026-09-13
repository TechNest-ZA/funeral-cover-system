package co.za.funeralcover.exception;

public class ChatRateLimitExceededException extends RuntimeException {
    public ChatRateLimitExceededException(String message) {
        super(message);
    }
}
