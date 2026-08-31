package co.za.funeralcover.dto;

public record NeedsCallItem(
        Long memberId,
        String fullName,
        String tenure,
        String plan,
        String state,
        String detail,
        String phone
) {
}
