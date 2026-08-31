package co.za.funeralcover.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record MemberSignupRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "ID number is required")
        @Pattern(regexp = "\\d{13}", message = "ID number must be exactly 13 digits")
        String idNumber,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "0\\d{9}", message = "Phone number must be 10 digits starting with 0")
        String phone,

        @NotBlank(message = "Please tell us who we should contact")
        String beneficiaryName,

        @NotBlank(message = "Please tell us their relationship to you")
        String beneficiaryRelationship,

        @NotBlank(message = "Please give us a phone number for them")
        @Pattern(regexp = "0\\d{9}", message = "Phone number must be 10 digits starting with 0")
        String beneficiaryPhone,

        @Pattern(regexp = "\\d{13}", message = "ID number must be exactly 13 digits")
        String beneficiaryIdNumber,

        @Email(message = "Email must be valid")
        String email,

        @NotNull(message = "Please select a plan")
        Long planId,

        /** Optional funeral-event QR token this signup came from - unrecognized/blank codes are ignored, never block signup. */
        String sourceCode
) {
}
