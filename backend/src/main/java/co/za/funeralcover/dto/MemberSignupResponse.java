package co.za.funeralcover.dto;

import co.za.funeralcover.entity.Member;

public record MemberSignupResponse(
        Long id,
        String fullName,
        String status,
        String accessToken
) {
    public static MemberSignupResponse from(Member member) {
        return new MemberSignupResponse(
                member.getId(),
                member.getFullName(),
                member.getStatus().name(),
                member.getAccessToken()
        );
    }
}
