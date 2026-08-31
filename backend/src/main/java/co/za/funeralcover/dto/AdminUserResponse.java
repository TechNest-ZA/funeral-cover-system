package co.za.funeralcover.dto;

import co.za.funeralcover.entity.AdminUser;

import java.time.Instant;

public record AdminUserResponse(
        Long id,
        String username,
        String role,
        Instant createdAt
) {
    public static AdminUserResponse from(AdminUser user) {
        return new AdminUserResponse(user.getId(), user.getUsername(), user.getRole().name(), user.getCreatedAt());
    }
}
