package co.za.funeralcover.dto;

public record LoginResponse(
        String token,
        String username,
        String role
) {
}
